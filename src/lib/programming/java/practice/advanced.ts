import type { Practice } from "../../types";
import { springDataJpa as springDataJpaPractice, projectResultsPortal as projectResultsPortalPractice } from "./more";

export const advanced: Record<string, Practice> = {
  "maven-and-junit": {
    solution: {
      notes: [
        "`ReportCard` takes a copy of the subject → score map, so callers can't change it afterwards. The empty case is handled explicitly: average 0, no best subject (an empty `Optional`) and grade F. The tests cover a normal report, a tie-free best subject and the empty report.",
      ],
      code: [
        {
          filename: "src/main/java/tz/dolese/grading/ReportCard.java",
          lang: "java",
          source: `
package tz.dolese.grading;

import java.util.Map;
import java.util.Optional;

public final class ReportCard {
    private final Map<String, Integer> scores;

    public ReportCard(Map<String, Integer> scores) {
        this.scores = Map.copyOf(scores);
    }

    public double average() {
        return scores.values().stream().mapToInt(Integer::intValue).average().orElse(0);
    }

    public Optional<String> bestSubject() {
        return scores.entrySet().stream().max(Map.Entry.comparingByValue()).map(Map.Entry::getKey);
    }

    public String overallGrade() {
        return Grading.gradeFor((int) Math.round(average()));
    }
}
`,
        },
        {
          filename: "src/test/java/tz/dolese/grading/ReportCardTest.java",
          lang: "java",
          source: `
package tz.dolese.grading;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ReportCardTest {

    @Test
    void summarisesScores() {
        var card = new ReportCard(Map.of("Maths", 88, "Biology", 79, "English", 91));
        assertEquals(86.0, card.average(), 0.01);
        assertEquals(Optional.of("English"), card.bestSubject());
        assertEquals("A", card.overallGrade());
    }

    @Test
    void gradesFromTheRoundedAverage() {
        var card = new ReportCard(Map.of("Maths", 64, "Biology", 65));   // 64.5 rounds to 65
        assertEquals("B", card.overallGrade());
    }

    @Test
    void handlesAnEmptyReportCard() {
        var card = new ReportCard(Map.of());
        assertEquals(0.0, card.average());
        assertTrue(card.bestSubject().isEmpty());
        assertEquals("F", card.overallGrade());
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Where do tests live in a standard Maven project?",
        options: ["`src/main/java`", "`src/test/java`", "`test/`", "Next to each class"],
        answer: 1,
        explanation: "Maven compiles and runs everything in `src/test/java` during `mvn test`.",
      },
      {
        question: "What does `@ParameterizedTest` with `@CsvSource` do?",
        options: [
          "Runs one test method once for each row of inputs",
          "Reads a CSV file into the program",
          "Skips the test",
          "Runs tests in parallel",
        ],
        answer: 0,
        explanation: "Ideal for boundary values without copy-pasting tests.",
      },
      {
        question: "How do you check that code throws an exception in JUnit?",
        options: [
          "`assertEquals(Exception.class, code())`",
          "Wrap it in try/catch and print",
          "`assertThrows(IllegalArgumentException.class, () -> code())`",
          "`assertTrue(code() == null)`",
        ],
        answer: 2,
        explanation: "`assertThrows` also returns the exception so you can check its message.",
      },
      {
        question: "What does the Maven Wrapper (`./mvnw`) give a team?",
        options: [
          "Faster tests",
          "A graphical interface",
          "Automatic deployment",
          "The same Maven version for everyone, without installing it separately",
        ],
        answer: 3,
        explanation: "The wrapper downloads the pinned Maven version on first use.",
      },
    ],
  },

  concurrency: {
    solution: {
      notes: [
        "Each \"service\" call starts as its own `CompletableFuture`, so all three run at the same time. `thenCombine` joins the results into a `Dashboard` record. The fee service fails, and `exceptionally` supplies a default balance so the dashboard still loads; `orTimeout` bounds each call.",
      ],
      code: [
        {
          filename: "DashboardLoader.java",
          lang: "java",
          source: `
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

public class DashboardLoader {
    record Dashboard(String name, List<Integer> results, long feeBalance) {}

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    static String fetchProfile()        { sleep(300); return "Amina Hassan"; }
    static List<Integer> fetchResults() { sleep(400); return List.of(88, 79, 91); }
    static long fetchFeeBalance()       { sleep(200); throw new IllegalStateException("fee service unavailable"); }

    public static void main(String[] args) {
        long start = System.nanoTime();

        var profile = CompletableFuture.supplyAsync(DashboardLoader::fetchProfile).orTimeout(2, TimeUnit.SECONDS);
        var results = CompletableFuture.supplyAsync(DashboardLoader::fetchResults).orTimeout(2, TimeUnit.SECONDS);
        var fees = CompletableFuture.supplyAsync(DashboardLoader::fetchFeeBalance)
            .orTimeout(2, TimeUnit.SECONDS)
            .exceptionally(err -> {
                System.out.println("Fee service failed (" + err.getCause().getMessage() + "), using default");
                return -1L;
            });

        Dashboard dashboard = profile
            .thenCombine(results, (name, scores) -> new Dashboard(name, scores, 0))
            .thenCombine(fees, (d, balance) -> new Dashboard(d.name(), d.results(), balance))
            .join();

        System.out.println(dashboard);
        System.out.printf("Loaded in %d ms (the slowest call took 400 ms)%n", (System.nanoTime() - start) / 1_000_000);
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why prefer an `ExecutorService` over creating `Thread` objects by hand?",
        options: [
          "Threads are deprecated",
          "The pool manages and reuses threads, and you get Futures for results",
          "Executors run code on the GPU",
          "Threads can't return values at all",
        ],
        answer: 1,
        explanation: "Since Java 21, try-with-resources also shuts the executor down for you.",
      },
      {
        question: "What does `thenCombine` do?",
        options: [
          "Waits for two futures and combines their results with a function",
          "Runs two futures one after the other",
          "Cancels the slower future",
          "Merges two lists",
        ],
        answer: 0,
        explanation: "It's how independent async results are joined.",
      },
      {
        question: "What does `exceptionally(err -> fallback)` provide?",
        options: [
          "A retry",
          "A log message",
          "A replacement value when the previous stage fails",
          "A timeout",
        ],
        answer: 2,
        explanation: "The pipeline continues with the fallback instead of failing.",
      },
      {
        question: "Why put `orTimeout` (or `get(timeout, unit)`) on async calls?",
        options: [
          "To speed them up",
          "It's required by the compiler",
          "To run them in order",
          "So a stuck dependency can't make your code wait forever",
        ],
        answer: 3,
        explanation: "Always bound waiting on things you don't control.",
      },
    ],
  },

  "virtual-threads-and-thread-safety": {
    solution: {
      notes: [
        "Fifty threads each make 1,000 deposits and 1,000 withdrawals of 1, so the final balance must equal the starting balance. The plain version loses updates; `synchronized` and `ReentrantLock` both protect the read-modify-write and get it right. The lock version also lets you try `tryLock` with a timeout.",
      ],
      code: [
        {
          filename: "AccountRace.java",
          lang: "java",
          source: `
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantLock;

public class AccountRace {
    interface Account { void deposit(long n); void withdraw(long n); long balance(); }

    static class Unsafe implements Account {
        private long balance = 1_000_000;
        public void deposit(long n) { balance += n; }
        public void withdraw(long n) { balance -= n; }
        public long balance() { return balance; }
    }

    static class Synchronized implements Account {
        private long balance = 1_000_000;
        public synchronized void deposit(long n) { balance += n; }
        public synchronized void withdraw(long n) { balance -= n; }
        public synchronized long balance() { return balance; }
    }

    static class Locked implements Account {
        private final ReentrantLock lock = new ReentrantLock();
        private long balance = 1_000_000;
        public void deposit(long n) { lock.lock(); try { balance += n; } finally { lock.unlock(); } }
        public void withdraw(long n) { lock.lock(); try { balance -= n; } finally { lock.unlock(); } }
        public long balance() { lock.lock(); try { return balance; } finally { lock.unlock(); } }
    }

    static void run(String label, Account account) {
        long start = System.nanoTime();
        try (ExecutorService pool = Executors.newFixedThreadPool(50)) {
            for (int t = 0; t < 50; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 1_000; i++) {
                        account.deposit(1);
                        account.withdraw(1);
                    }
                });
            }
        }
        System.out.printf("%-13s balance %,d (expected 1,000,000) in %d ms%n",
            label, account.balance(), (System.nanoTime() - start) / 1_000_000);
    }

    public static void main(String[] args) {
        run("unsafe", new Unsafe());
        run("synchronized", new Synchronized());
        run("lock", new Locked());
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why is `count++` unsafe when several threads run it?",
        options: [
          "`++` is slow",
          "It's really read, add, write — two threads can interleave and lose an update",
          "Integers can't be shared",
          "It throws an exception",
        ],
        answer: 1,
        explanation: "That's a race condition.",
      },
      {
        question: "Which class makes a counter thread-safe without locks?",
        options: ["`Integer`", "`int[]`", "`AtomicInteger`", "`StringBuilder`"],
        answer: 2,
        explanation: "Atomic classes use hardware instructions for safe updates.",
      },
      {
        question: "When do virtual threads help most?",
        options: [
          "With lots of blocking I/O — many tasks waiting on HTTP calls or databases",
          "For CPU-heavy maths",
          "For single-threaded programs",
          "For reading small files",
        ],
        answer: 0,
        explanation: "For CPU-bound work, use a pool sized to your CPU cores.",
      },
      {
        question: "Why release a `ReentrantLock` in a `finally` block?",
        options: [
          "It's faster",
          "The compiler requires it",
          "To lock it twice",
          "So the lock is released even if the code inside throws — otherwise other threads wait forever",
        ],
        answer: 3,
        explanation: "`lock(); try { ... } finally { unlock(); }` is the standard pattern.",
      },
    ],
  },

  "http-client-and-server": {
    solution: {
      notes: [
        "The handler now distinguishes `/scores` (the collection) from `/scores/{name}`. `GET /scores` builds a JSON object from the map, and `DELETE` removes a student. On the client side, `sendAsync` starts five independent requests at once and `CompletableFuture.allOf` waits for them together. The full list is fetched afterwards: run alongside the DELETE, its result would depend on which request the server handled first.",
      ],
      code: [
        {
          filename: "HttpDemo2.java",
          lang: "java",
          source: `
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

public class HttpDemo2 {
    static final Map<String, Integer> SCORES = new ConcurrentHashMap<>(Map.of("amina", 88, "juma", 42, "neema", 71));

    static void send(HttpExchange ex, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, status == 204 ? -1 : body.length);
        if (status != 204) try (var out = ex.getResponseBody()) { out.write(body); }
    }

    static void handle(HttpExchange ex) throws IOException {
        String name = ex.getRequestURI().getPath().replaceFirst("^/scores/?", "").toLowerCase();
        String method = ex.getRequestMethod();

        if (name.isEmpty() && method.equals("GET")) {
            String json = new TreeMap<>(SCORES).entrySet().stream()
                .map(e -> "\\"%s\\":%d".formatted(e.getKey(), e.getValue()))
                .collect(Collectors.joining(",", "{", "}"));
            send(ex, 200, json);
        } else if (method.equals("GET")) {
            Integer score = SCORES.get(name);
            if (score == null) send(ex, 404, "{\\"error\\":\\"not found\\"}");
            else send(ex, 200, "{\\"student\\":\\"%s\\",\\"score\\":%d}".formatted(name, score));
        } else if (method.equals("DELETE")) {
            if (SCORES.remove(name) == null) send(ex, 404, "{\\"error\\":\\"not found\\"}");
            else send(ex, 204, "");
        } else {
            send(ex, 405, "{\\"error\\":\\"method not allowed\\"}");
        }
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 8080), 0);
        server.createContext("/scores", ex -> { try { handle(ex); } finally { ex.close(); } });
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        HttpClient client = HttpClient.newHttpClient();
        String base = "http://localhost:8080/scores";
        List<HttpRequest> requests = List.of(                      // independent requests, safe to run together
            HttpRequest.newBuilder(URI.create(base + "/amina")).GET().build(),
            HttpRequest.newBuilder(URI.create(base + "/neema")).GET().build(),
            HttpRequest.newBuilder(URI.create(base + "/ali")).GET().build(),
            HttpRequest.newBuilder(URI.create(base + "/juma")).DELETE().build(),
            HttpRequest.newBuilder(URI.create(base + "/nobody")).DELETE().build());

        List<CompletableFuture<HttpResponse<String>>> futures = requests.stream()
            .map(r -> client.sendAsync(r, HttpResponse.BodyHandlers.ofString()))
            .toList();
        CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();   // all five in flight together

        for (int i = 0; i < requests.size(); i++) {
            HttpResponse<String> res = futures.get(i).join();
            System.out.println(requests.get(i).method() + " " + requests.get(i).uri().getPath() + " -> " + res.statusCode() + " " + res.body());
        }
        HttpResponse<String> all = client.send(HttpRequest.newBuilder(URI.create(base)).GET().build(),
            HttpResponse.BodyHandlers.ofString());                  // after the batch, so the result is predictable
        System.out.println("GET /scores -> " + all.statusCode() + " " + all.body());
        server.stop(0);
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which status code fits a successful DELETE that returns no body?",
        options: ["200 OK with an empty object", "201 Created", "204 No Content", "404 Not Found"],
        answer: 2,
        explanation: "204 says \"done, nothing to send back\".",
      },
      {
        question: "What does `client.sendAsync(...)` return?",
        options: [
          "A `CompletableFuture` that completes with the response",
          "The response directly",
          "Nothing",
          "A Thread",
        ],
        answer: 0,
        explanation: "Several async requests can be in flight at once.",
      },
      {
        question: "Why set a `connectTimeout` on the HttpClient?",
        options: [
          "To limit response size",
          "It's required for HTTPS",
          "To enable HTTP/2",
          "So an unreachable server fails quickly instead of hanging",
        ],
        answer: 3,
        explanation: "Add per-request `timeout` values too.",
      },
      {
        question: "In real projects, what should you use instead of building JSON strings by hand?",
        options: ["XML", "A JSON library such as Jackson", "String.format everywhere", "CSV"],
        answer: 1,
        explanation: "Libraries handle escaping and nested structures correctly.",
      },
    ],
  },

  "jdbc-postgresql": {
    solution: {
      notes: [
        "The repository hides all SQL behind three methods. `save` uses `RETURNING id`, `findById` returns an `Optional` instead of null, and `findByForm` maps each row to a record. Every statement is a `PreparedStatement`, and every resource is closed by try-with-resources.",
      ],
      code: [
        {
          filename: "StudentRepository.java",
          lang: "java",
          source: `
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class StudentRepository {
    record Student(Long id, String fullName, int form, String stream, String gender) {}

    private final String url;

    StudentRepository(String url) { this.url = url; }

    Student save(Student s) throws SQLException {
        String sql = "INSERT INTO students (full_name, form, stream, gender) VALUES (?, ?, ?, ?) RETURNING id";
        try (Connection c = DriverManager.getConnection(url); PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, s.fullName());
            ps.setInt(2, s.form());
            ps.setString(3, s.stream());
            ps.setString(4, s.gender());
            try (ResultSet rs = ps.executeQuery()) {
                rs.next();
                return new Student(rs.getLong("id"), s.fullName(), s.form(), s.stream(), s.gender());
            }
        }
    }

    Optional<Student> findById(long id) throws SQLException {
        try (Connection c = DriverManager.getConnection(url);
             PreparedStatement ps = c.prepareStatement("SELECT id, full_name, form, stream, gender FROM students WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(map(rs)) : Optional.empty();
            }
        }
    }

    List<Student> findByForm(int form) throws SQLException {
        try (Connection c = DriverManager.getConnection(url);
             PreparedStatement ps = c.prepareStatement(
                 "SELECT id, full_name, form, stream, gender FROM students WHERE form = ? ORDER BY full_name")) {
            ps.setInt(1, form);
            List<Student> out = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) out.add(map(rs));
            }
            return out;
        }
    }

    private static Student map(ResultSet rs) throws SQLException {
        return new Student(rs.getLong("id"), rs.getString("full_name"), rs.getInt("form"),
                           rs.getString("stream"), rs.getString("gender"));
    }

    public static void main(String[] args) throws SQLException {
        var repo = new StudentRepository(System.getenv().getOrDefault("DATABASE_URL",
            "jdbc:postgresql://localhost:5432/school?user=postgres&password=postgres"));

        Student saved = repo.save(new Student(null, "Halima Omari", 2, "B", "F"));
        System.out.println("Saved: " + saved);
        System.out.println("Found: " + repo.findById(saved.id()).orElseThrow());
        System.out.println("Missing: " + repo.findById(999_999));
        repo.findByForm(2).forEach(s -> System.out.println("Form 2: " + s.fullName()));
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why use `PreparedStatement` with `?` placeholders?",
        options: [
          "It's the only way to run SELECT",
          "Values are sent separately from the SQL, preventing SQL injection",
          "It formats numbers",
          "It opens a connection",
        ],
        answer: 1,
        explanation: "Never concatenate user input into SQL strings.",
      },
      {
        question: "What happens to a JDBC transaction after `conn.setAutoCommit(false)` and an exception?",
        options: [
          "Changes are saved automatically",
          "The database restarts",
          "Nothing is saved until you `commit()`; call `rollback()` to discard the changes",
          "An index is created",
        ],
        answer: 2,
        explanation: "You control the transaction boundary explicitly.",
      },
      {
        question: "Why should `findById` return `Optional<Student>`?",
        options: [
          "It makes the absent case explicit, so callers handle \"not found\" instead of getting null",
          "Optional is faster",
          "JDBC requires it",
          "To return several students",
        ],
        answer: 0,
        explanation: "The type tells callers the result may be missing.",
      },
      {
        question: "What should a web server use instead of opening a new connection per request?",
        options: [
          "A static Connection shared without locks",
          "A new database per user",
          "Files",
          "A connection pool such as HikariCP",
        ],
        answer: 3,
        explanation: "Connecting is expensive; pools reuse a few open connections.",
      },
    ],
  },

  "spring-boot": {
    solution: {
      notes: [
        "The service gains `list(form)`, `update` and `delete`; the controller maps them to `GET` with an optional `@RequestParam`, `PUT` and `DELETE`. Unknown ids still raise `StudentNotFoundException`, which becomes a 404. The tests cover each endpoint and its error case.",
      ],
      code: [
        {
          filename: "StudentController.java (additions)",
          lang: "java",
          source: `
// In StudentService:
List<StudentResponse> list(Integer form) {
    return store.entrySet().stream()
        .filter(e -> form == null || e.getValue().form() == form)
        .sorted(Map.Entry.comparingByKey())
        .map(e -> toResponse(e.getKey(), e.getValue()))
        .toList();
}

StudentResponse update(long id, StudentRequest req) {
    if (!store.containsKey(id)) throw new StudentNotFoundException(id);
    store.put(id, req);
    return toResponse(id, req);
}

void delete(long id) {
    if (store.remove(id) == null) throw new StudentNotFoundException(id);
}

// In StudentController:
@GetMapping
List<StudentResponse> list(@RequestParam(required = false) Integer form) {
    return service.list(form);
}

@PutMapping("/{id}")
StudentResponse update(@PathVariable long id, @Valid @RequestBody StudentRequest request) {
    return service.update(id, request);
}

@DeleteMapping("/{id}")
@ResponseStatus(HttpStatus.NO_CONTENT)
void delete(@PathVariable long id) {
    service.delete(id);
}
`,
        },
        {
          filename: "src/test/java/tz/dolese/results/StudentCrudTest.java",
          lang: "java",
          source: `
package tz.dolese.results;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class StudentCrudTest {
    @Autowired MockMvc mvc;

    void create(String json) throws Exception {
        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON).content(json))
            .andExpect(status().isCreated());
    }

    @Test
    void filtersByForm() throws Exception {
        create("{\\"name\\":\\"Amina\\",\\"form\\":4}");
        create("{\\"name\\":\\"Juma\\",\\"form\\":3}");
        mvc.perform(get("/api/students").param("form", "4"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(1))
            .andExpect(jsonPath("$[0].name").value("Amina"));
    }

    @Test
    void updatesAndDeletes() throws Exception {
        create("{\\"name\\":\\"Amina\\",\\"form\\":4}");
        mvc.perform(put("/api/students/1").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"Amina Hassan\\",\\"form\\":4,\\"scores\\":[90]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.average").value(90.0));
        mvc.perform(delete("/api/students/1")).andExpect(status().isNoContent());
        mvc.perform(delete("/api/students/1")).andExpect(status().isNotFound());
        mvc.perform(put("/api/students/9").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"Nobody\\",\\"form\\":1}"))
            .andExpect(status().isNotFound());
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `@RestController` do?",
        options: [
          "Marks a class whose methods handle HTTP requests and return response bodies (usually JSON)",
          "Starts a database",
          "Creates a test",
          "Defines a JPA entity",
        ],
        answer: 0,
        explanation: "Combine it with `@GetMapping`, `@PostMapping` and friends.",
      },
      {
        question: "What happens when a `@Valid @RequestBody` fails validation?",
        options: [
          "The method runs with null values",
          "The app crashes",
          "Spring returns 400 Bad Request without calling the method",
          "The invalid fields are removed",
        ],
        answer: 2,
        explanation: "Jakarta Validation annotations like `@NotBlank` and `@Min` are checked first.",
      },
      {
        question: "Why prefer constructor injection over field injection?",
        options: [
          "It's required by Java",
          "Dependencies are explicit, can be `final`, and tests can pass fakes easily",
          "It's faster at runtime",
          "Spring doesn't support field injection",
        ],
        answer: 1,
        explanation: "The class can't be created without what it needs.",
      },
      {
        question: "How does `@ResponseStatus(HttpStatus.NOT_FOUND)` on an exception class help?",
        options: [
          "It logs the exception",
          "It retries the request",
          "It hides the exception",
          "When thrown from a controller, Spring responds with 404",
        ],
        answer: 3,
        explanation: "Domain exceptions map cleanly to HTTP statuses.",
      },
    ],
  },

  "production-jvm": {
    solution: {
      notes: [
        "Add the Actuator starter and expose the health endpoint. Package with `mvn package` and run the image with a 512 MB memory limit; the JVM sizes its heap from `MaxRAMPercentage`. The runtime-only image has no `jcmd`, so start Flight Recorder with a JVM flag instead: it records the first 30 seconds while you send requests. Copy the recording out and inspect it with the `jfr` tool from your JDK.",
      ],
      code: [
        {
          filename: "pom.xml (dependency)",
          lang: "xml",
          source: `
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
`,
        },
        {
          filename: "src/main/resources/application.properties",
          lang: "text",
          source: `
management.endpoints.web.exposure.include=health,info
management.endpoint.health.probes.enabled=true
server.shutdown=graceful
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
mvn -q package -DskipTests
docker build -t results-api .
docker run -d --name results-api -p 8080:8080 -m 512m \\
  -e JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:StartFlightRecording=duration=30s,filename=/tmp/rec.jfr" \\
  results-api

curl localhost:8080/actuator/health          # {"status":"UP",...}
for i in $(seq 1 200); do curl -s -o /dev/null localhost:8080/api/students/1; done

sleep 35                                     # let the 30-second recording finish
docker cp results-api:/tmp/rec.jfr .
jfr summary rec.jfr | head -20
docker stop results-api                      # graceful shutdown in the logs
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which JVM option sizes the heap relative to a container's memory limit?",
        options: ["`-Xss`", "`-XX:MaxRAMPercentage`", "`-verbose:gc`", "`-jar`"],
        answer: 1,
        explanation: "e.g. `-XX:MaxRAMPercentage=75` uses 75% of the container's memory for the heap.",
      },
      {
        question: "What is Java Flight Recorder (JFR)?",
        options: [
          "A logging library",
          "A debugger that pauses the JVM",
          "A low-overhead profiler built into the JDK, safe to use in production",
          "A build tool",
        ],
        answer: 2,
        explanation: "Start it with `jcmd <pid> JFR.start` and analyse the recording afterwards.",
      },
      {
        question: "What does `jcmd <pid> Thread.print` produce?",
        options: [
          "A thread dump — useful for finding deadlocks and stuck requests",
          "A heap dump",
          "The JVM version",
          "A list of open files",
        ],
        answer: 0,
        explanation: "Each thread's stack trace shows what it's doing right now.",
      },
      {
        question: "Why run the container as a non-root user?",
        options: [
          "Java requires it",
          "It makes startup faster",
          "It lowers memory use",
          "It limits the damage if the application is compromised",
        ],
        answer: 3,
        explanation: "Least privilege applies to processes too.",
      },
    ],
  },
  "spring-data-jpa": springDataJpaPractice,
  "project-results-portal-api": projectResultsPortalPractice,
};
