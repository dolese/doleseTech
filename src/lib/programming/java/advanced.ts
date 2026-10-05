import type { LevelTrack } from "../types";
import { springDataJpa, projectResultsPortal } from "./more";

export const advanced: LevelTrack = {
  intro:
    "Build and run professional Java systems: Maven projects with JUnit tests, concurrency with executors, CompletableFuture and virtual threads, thread safety, HTTP clients and servers, PostgreSQL with JDBC, REST APIs with Spring Boot, and packaging and tuning the JVM for production.",
  outcomes: [
    "Structure Maven projects and test them with JUnit",
    "Write correct concurrent code with executors, CompletableFuture and virtual threads",
    "Call and serve HTTP, and use PostgreSQL safely through JDBC",
    "Build a validated REST API with Spring Boot and ship it to production",
  ],
  lessons: [
    {
      slug: "maven-and-junit",
      title: "Maven Projects & Testing with JUnit",
      summary: "Standard project layout, pom.xml dependencies, and unit tests with JUnit including parameterized tests.",
      body: [
        "Real Java projects use a build tool. Maven (and Gradle) download dependencies, compile, run tests and package your application. Maven projects follow a standard layout: production code in `src/main/java`, tests in `src/test/java`, and everything configured in `pom.xml`.",
        "JUnit is the standard testing framework. Annotate test methods with `@Test`, check results with `assertEquals`, `assertTrue` and `assertThrows`, and use `@ParameterizedTest` to run one test with many inputs — ideal for boundary values.",
        "`mvn test` compiles and runs all tests; `mvn package` also builds a `.jar`. The Maven Wrapper (`./mvnw`) pins the Maven version for everyone on the team.",
      ],
      code: [
        {
          filename: "Project layout",
          lang: "text",
          source: `
grading/
├── pom.xml
└── src/
    ├── main/java/tz/dolese/grading/Grading.java
    └── test/java/tz/dolese/grading/GradingTest.java
`,
        },
        {
          filename: "pom.xml",
          lang: "xml",
          source: `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>tz.dolese</groupId>
  <artifactId>grading</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.release>21</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.junit.jupiter</groupId>
      <artifactId>junit-jupiter</artifactId>
      <version>6.1.3</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.5.4</version>
      </plugin>
    </plugins>
  </build>
</project>
`,
        },
        {
          filename: "src/main/java/tz/dolese/grading/Grading.java",
          lang: "java",
          source: `
package tz.dolese.grading;

public final class Grading {
    private Grading() {}

    public static String gradeFor(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("score must be between 0 and 100");
        }
        if (score >= 75) return "A";
        if (score >= 65) return "B";
        if (score >= 45) return "C";
        if (score >= 30) return "D";
        return "F";
    }

    public static double average(int... scores) {
        if (scores.length == 0) return 0;
        long total = 0;
        for (int s : scores) total += s;
        return (double) total / scores.length;
    }
}
`,
        },
        {
          filename: "src/test/java/tz/dolese/grading/GradingTest.java",
          lang: "java",
          source: `
package tz.dolese.grading;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

class GradingTest {

    @ParameterizedTest(name = "{0} -> {1}")
    @CsvSource({"100,A", "75,A", "74,B", "65,B", "64,C", "45,C", "30,D", "29,F", "0,F"})
    void gradeBoundaries(int score, String expected) {
        assertEquals(expected, Grading.gradeFor(score));
    }

    @ParameterizedTest
    @ValueSource(ints = {-1, 101})
    void rejectsOutOfRange(int score) {
        var e = assertThrows(IllegalArgumentException.class, () -> Grading.gradeFor(score));
        assertTrue(e.getMessage().contains("between 0 and 100"));
    }

    @Test
    @DisplayName("average of no scores is zero")
    void emptyAverage() {
        assertEquals(0.0, Grading.average());
    }

    @Test
    void averageOfScores() {
        assertEquals(77.67, Grading.average(78, 64, 91), 0.01);
    }
}
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
mvn test        # compile and run all tests
mvn package     # build target/grading-1.0.0.jar
`,
        },
      ],
      keyPoints: [
        "Standard layout: `src/main/java`, `src/test/java`, configured by `pom.xml`.",
        "Test boundaries and failure cases; `@ParameterizedTest` avoids copy-pasted tests.",
        "`mvn test` on every change (and in CI) keeps regressions out.",
      ],
      exercise:
        "Add a `ReportCard` class to the project that takes a map of subject → score and computes the average, best subject and overall grade. Write JUnit tests for it, including an empty report card.",
    },
    {
      slug: "concurrency",
      title: "Concurrency: Executors & CompletableFuture",
      summary: "Run work in parallel with thread pools, collect results with futures, and compose async tasks.",
      body: [
        "Creating raw `Thread` objects by hand is error-prone. Use an `ExecutorService` instead: submit tasks, receive `Future`s, and let the pool manage threads. Since Java 21, `ExecutorService` is `AutoCloseable`, so try-with-resources waits for tasks and shuts the pool down.",
        "`CompletableFuture` composes asynchronous steps: `supplyAsync` starts work, `thenApply` transforms the result, `thenCombine` joins two results, `allOf` waits for many, and `exceptionally` provides a fallback on failure. `orTimeout` fails a step that takes too long.",
        "Use concurrency for independent work — calling several services, processing many files. Measure first: for small tasks, the coordination overhead can make parallel code slower.",
      ],
      code: [
        {
          filename: "Concurrency.java",
          lang: "java",
          source: `
import java.util.List;
import java.util.concurrent.*;

public class Concurrency {
    static int slowScoreLookup(String student) {
        sleep(300);                                  // pretend: a remote call
        return Math.abs(student.hashCode()) % 101;
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    public static void main(String[] args) throws Exception {
        List<String> students = List.of("Amina", "Juma", "Neema", "Ali", "Rehema", "Baraka");

        long start = System.nanoTime();
        try (ExecutorService pool = Executors.newFixedThreadPool(6)) {
            List<Future<Integer>> futures = students.stream()
                .map(s -> pool.submit(() -> slowScoreLookup(s)))
                .toList();
            int total = 0;
            for (Future<Integer> f : futures) total += f.get();
            System.out.printf("Total %d in %d ms (not %d)%n",
                total, (System.nanoTime() - start) / 1_000_000, students.size() * 300);
        }

        CompletableFuture<String> profile = CompletableFuture.supplyAsync(() -> { sleep(200); return "Amina Hassan"; });
        CompletableFuture<Integer> score = CompletableFuture.supplyAsync(() -> { sleep(250); return 88; });

        String report = profile
            .thenCombine(score, (name, s) -> name + " scored " + s)
            .thenApply(String::toUpperCase)
            .get(2, TimeUnit.SECONDS);
        System.out.println(report);

        String fallback = CompletableFuture
            .supplyAsync(() -> { if (true) throw new IllegalStateException("SMS gateway down"); return "sent"; })
            .exceptionally(err -> "queued for retry (" + err.getCause().getMessage() + ")")
            .join();
        System.out.println(fallback);

        try {
            CompletableFuture.supplyAsync(() -> { sleep(1000); return "late"; })
                .orTimeout(100, TimeUnit.MILLISECONDS)
                .join();
        } catch (CompletionException e) {
            System.out.println("Timed out: " + e.getCause().getClass().getSimpleName());
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "Use `ExecutorService` (in try-with-resources) instead of raw threads.",
        "`CompletableFuture` composes async steps, combines results and handles failures.",
        "Always bound waiting with timeouts (`get(timeout)`, `orTimeout`).",
      ],
      exercise:
        "Simulate fetching a student's profile, results and fee balance from three \"services\" (with different sleeps) using `CompletableFuture`, combine them into one `Dashboard` record, and fall back to a default fee balance if that service throws.",
    },
    {
      slug: "virtual-threads-and-thread-safety",
      title: "Virtual Threads & Thread Safety",
      summary: "Race conditions, atomics, concurrent collections, locks, and massive concurrency with virtual threads.",
      body: [
        "When threads share mutable data, a race condition can corrupt it: `count++` is really read-add-write, and two threads can interleave and lose updates. The fixes, from simplest: avoid shared mutable state; use atomic classes (`AtomicInteger`, `LongAdder`); use concurrent collections (`ConcurrentHashMap`); or guard critical sections with `synchronized` or a `ReentrantLock`.",
        "Virtual threads (Java 21) are lightweight threads managed by the JVM. You can run hundreds of thousands at once, so blocking code — waiting on HTTP calls or databases — scales without async callbacks. Create one per task with `Executors.newVirtualThreadPerTaskExecutor()`.",
        "Virtual threads help I/O-bound work, not CPU-bound work: for heavy computation, use a fixed pool sized to your CPU cores (or parallel streams).",
      ],
      code: [
        {
          filename: "ThreadSafety.java",
          lang: "java",
          source: `
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

public class ThreadSafety {
    static int unsafeCount = 0;

    public static void main(String[] args) {
        AtomicInteger safeCount = new AtomicInteger();

        try (ExecutorService pool = Executors.newFixedThreadPool(8)) {
            for (int t = 0; t < 8; t++) {
                pool.submit(() -> {
                    for (int i = 0; i < 100_000; i++) {
                        unsafeCount++;                 // race condition
                        safeCount.incrementAndGet();   // atomic
                    }
                });
            }
        }
        System.out.println("unsafe: " + unsafeCount + " (expected 800000)");
        System.out.println("atomic: " + safeCount.get());

        ConcurrentHashMap<String, Integer> votes = new ConcurrentHashMap<>();
        IntStream.range(0, 10_000).parallel()
            .forEach(i -> votes.merge(i % 3 == 0 ? "debate" : "science", 1, Integer::sum));
        System.out.println(votes);

        long start = System.nanoTime();
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            IntStream.range(0, 10_000).forEach(i -> executor.submit(() -> {
                Thread.sleep(Duration.ofSeconds(1));   // e.g. waiting for an SMS gateway
                return i;
            }));
        }
        System.out.printf("10,000 blocking tasks on virtual threads took %.1f s%n",
            (System.nanoTime() - start) / 1e9);
    }
}
`,
        },
      ],
      keyPoints: [
        "Shared mutable state + threads = race conditions; prefer immutability.",
        "Use atomics, `ConcurrentHashMap` or locks when sharing is unavoidable.",
        "Virtual threads make blocking I/O scale; use fixed pools for CPU-heavy work.",
      ],
      exercise:
        "Write a `BankAccount` with `deposit` and `withdraw` used by 50 threads at once. Show that a plain `long` balance goes wrong, then fix it with `synchronized` and again with a `ReentrantLock`, and compare the timings.",
    },
    {
      slug: "http-client-and-server",
      title: "HTTP: HttpClient & a Built-in Server",
      summary: "Serve a small JSON API with the JDK's HttpServer and call it with java.net.http.HttpClient.",
      body: [
        "The JDK includes everything for basic HTTP: `java.net.http.HttpClient` makes requests (synchronous or async, HTTP/2, timeouts), and `com.sun.net.httpserver.HttpServer` serves them. They're perfect for tools, tests and small services — and for understanding what frameworks such as Spring do for you.",
        "Each handler receives an `HttpExchange`: read the method, path and body, then send a status code, headers and response body. Always set `Content-Type` and the correct status codes.",
        "Give the client a `connectTimeout` and each request a `timeout`, and check `response.statusCode()` before trusting the body. In real projects, use a JSON library such as Jackson instead of building JSON strings by hand.",
      ],
      code: [
        {
          filename: "HttpDemo.java",
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
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;

public class HttpDemo {
    static final Map<String, Integer> SCORES = new ConcurrentHashMap<>(Map.of("amina", 88, "juma", 42));

    static void send(HttpExchange ex, int status, String json) throws IOException {
        byte[] body = json.getBytes(StandardCharsets.UTF_8);
        ex.getResponseHeaders().set("Content-Type", "application/json");
        ex.sendResponseHeaders(status, body.length);
        try (var out = ex.getResponseBody()) { out.write(body); }
    }

    static void handleScores(HttpExchange ex) throws IOException {
        String name = ex.getRequestURI().getPath().replaceFirst("^/scores/?", "").toLowerCase();
        switch (ex.getRequestMethod()) {
            case "GET" -> {
                Integer score = SCORES.get(name);
                if (score == null) send(ex, 404, "{\\"error\\":\\"not found\\"}");
                else send(ex, 200, "{\\"student\\":\\"%s\\",\\"score\\":%d}".formatted(name, score));
            }
            case "PUT" -> {
                String body = new String(ex.getRequestBody().readAllBytes(), StandardCharsets.UTF_8).trim();
                try {
                    int score = Integer.parseInt(body);
                    if (score < 0 || score > 100) throw new NumberFormatException();
                    SCORES.put(name, score);
                    send(ex, 200, "{\\"saved\\":%d}".formatted(score));
                } catch (NumberFormatException e) {
                    send(ex, 400, "{\\"error\\":\\"score must be 0-100\\"}");
                }
            }
            default -> send(ex, 405, "{\\"error\\":\\"method not allowed\\"}");
        }
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("localhost", 8080), 0);
        server.createContext("/scores", ex -> {
            try { handleScores(ex); } finally { ex.close(); }
        });
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();
        System.out.println("Listening on http://localhost:8080/scores/{name}");

        HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(2)).build();
        String base = "http://localhost:8080/scores/";

        for (var req : new HttpRequest[]{
            HttpRequest.newBuilder(URI.create(base + "amina")).GET().build(),
            HttpRequest.newBuilder(URI.create(base + "neema")).PUT(HttpRequest.BodyPublishers.ofString("91")).build(),
            HttpRequest.newBuilder(URI.create(base + "neema")).GET().build(),
            HttpRequest.newBuilder(URI.create(base + "juma")).PUT(HttpRequest.BodyPublishers.ofString("150")).build(),
            HttpRequest.newBuilder(URI.create(base + "ali")).GET().build(),
        }) {
            HttpResponse<String> res = client.send(
                HttpRequest.newBuilder(req, (n, v) -> true).timeout(Duration.ofSeconds(5)).build(),
                HttpResponse.BodyHandlers.ofString());
            System.out.println(req.method() + " " + req.uri().getPath() + " -> " + res.statusCode() + " " + res.body());
        }

        server.stop(0);
    }
}
`,
        },
      ],
      keyPoints: [
        "`HttpClient` (with timeouts) and `HttpServer` ship with the JDK.",
        "Set `Content-Type`, return accurate status codes and validate request bodies.",
        "Use a JSON library (Jackson) in real projects instead of hand-built strings.",
      ],
      exercise:
        "Add `GET /scores` that returns all scores as a JSON object, and `DELETE /scores/{name}`. Then make the client send the five requests concurrently with `client.sendAsync` and `CompletableFuture.allOf`.",
    },
    {
      slug: "jdbc-postgresql",
      title: "Databases with JDBC & PostgreSQL",
      summary: "Connect to PostgreSQL, run PreparedStatements, map rows to records and use transactions.",
      body: [
        "JDBC is Java's standard database API; each database provides a driver (for PostgreSQL, `org.postgresql:postgresql`). Open a `Connection`, prepare a statement, execute it, and read the `ResultSet` — all inside try-with-resources so everything is closed.",
        "Always use `PreparedStatement` with `?` placeholders. Values are sent separately from the SQL, which prevents SQL injection and lets the database reuse the query plan. Never concatenate user input into SQL.",
        "Turn off auto-commit to group statements into a transaction, then `commit()` or `rollback()`. In servers, use a connection pool such as HikariCP (Spring Boot includes it). See the PostgreSQL track on this site for the SQL itself.",
      ],
      code: [
        {
          filename: "Terminal",
          lang: "bash",
          source: `
curl -O https://repo1.maven.org/maven2/org/postgresql/postgresql/42.7.13/postgresql-42.7.13.jar
export DATABASE_URL="jdbc:postgresql://localhost:5432/school?user=postgres&password=postgres"
java -cp postgresql-42.7.13.jar Jdbc.java
`,
        },
        {
          filename: "Jdbc.java",
          lang: "java",
          source: `
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class Jdbc {
    record Result(String name, String subject, int score) {}

    public static void main(String[] args) throws SQLException {
        String url = System.getenv().getOrDefault("DATABASE_URL",
            "jdbc:postgresql://localhost:5432/school?user=postgres&password=postgres");

        try (Connection conn = DriverManager.getConnection(url)) {
            try (Statement st = conn.createStatement()) {
                st.execute("""
                    CREATE TABLE IF NOT EXISTS java_results (
                        id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
                        name    text NOT NULL,
                        subject text NOT NULL,
                        score   int  NOT NULL CHECK (score BETWEEN 0 AND 100)
                    )""");
                st.execute("TRUNCATE java_results");
            }

            String insert = "INSERT INTO java_results (name, subject, score) VALUES (?, ?, ?)";
            conn.setAutoCommit(false);                       // start a transaction
            try (PreparedStatement ps = conn.prepareStatement(insert)) {
                for (Result r : List.of(new Result("Amina", "Maths", 88),
                                        new Result("Juma", "Maths", 42),
                                        new Result("Neema", "Biology", 71))) {
                    ps.setString(1, r.name());
                    ps.setString(2, r.subject());
                    ps.setInt(3, r.score());
                    ps.addBatch();
                }
                ps.executeBatch();
                conn.commit();
            }

            try (PreparedStatement ps = conn.prepareStatement(insert)) {
                ps.setString(1, "Ali");   ps.setString(2, "Maths"); ps.setInt(3, 50);  ps.executeUpdate();
                ps.setString(1, "Bad");   ps.setString(2, "Maths"); ps.setInt(3, 150); ps.executeUpdate();
                conn.commit();
            } catch (SQLException e) {
                conn.rollback();                              // Ali is not saved either
                System.out.println("Rolled back: " + e.getSQLState() + " check_violation");
            }
            conn.setAutoCommit(true);

            String malicious = "Amina' OR '1'='1";
            try (PreparedStatement ps = conn.prepareStatement("SELECT count(*) FROM java_results WHERE name = ?")) {
                ps.setString(1, malicious);
                try (ResultSet rs = ps.executeQuery()) {
                    rs.next();
                    System.out.println("Rows matching injection attempt: " + rs.getInt(1));   // 0
                }
            }

            List<Result> passed = new ArrayList<>();
            try (PreparedStatement ps = conn.prepareStatement(
                    "SELECT name, subject, score FROM java_results WHERE score >= ? ORDER BY score DESC")) {
                ps.setInt(1, 45);
                try (ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
                        passed.add(new Result(rs.getString("name"), rs.getString("subject"), rs.getInt("score")));
                    }
                }
            }
            passed.forEach(System.out::println);
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "Always use `PreparedStatement` placeholders — never build SQL from user input.",
        "Close connections, statements and result sets with try-with-resources.",
        "Group related changes in a transaction; use a connection pool in servers.",
      ],
      exercise:
        "Write a small `StudentRepository` class with `save`, `findById` (returning `Optional`) and `findByForm` methods using JDBC against the `students` table from the PostgreSQL track, and a `main` method that exercises each one.",
    },
    {
      slug: "spring-boot",
      title: "REST APIs with Spring Boot",
      summary: "Controllers, records as DTOs, validation, error handling and tests with MockMvc.",
      body: [
        "Spring Boot is the most widely used Java framework for web services. It configures an embedded web server, JSON conversion, validation and much more automatically, so a REST API is a few annotated classes. Generate projects at start.spring.io.",
        "A `@RestController` maps HTTP requests to methods (`@GetMapping`, `@PostMapping`). Records make clean request and response types; Jakarta Validation annotations (`@NotBlank`, `@Min`, `@Max`) plus `@Valid` reject bad input with a 400 response automatically.",
        "Spring injects dependencies through constructors: declare a `@Service` and ask for it in the controller's constructor. Map your own exceptions to HTTP statuses with `@ResponseStatus` or an exception handler, and test the whole web layer with MockMvc.",
      ],
      code: [
        {
          filename: "pom.xml",
          lang: "xml",
          source: `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
  </parent>
  <groupId>tz.dolese</groupId>
  <artifactId>results-api</artifactId>
  <version>1.0.0</version>

  <properties>
    <java.version>21</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`,
        },
        {
          filename: "src/main/java/tz/dolese/results/ResultsApplication.java",
          lang: "java",
          source: `
package tz.dolese.results;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ResultsApplication {
    public static void main(String[] args) {
        SpringApplication.run(ResultsApplication.class, args);
    }
}
`,
        },
        {
          filename: "src/main/java/tz/dolese/results/StudentController.java",
          lang: "java",
          source: `
package tz.dolese.results;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

record StudentRequest(@NotBlank String name, @Min(1) @Max(6) int form, List<@Min(0) @Max(100) Integer> scores) {}

record StudentResponse(long id, String name, int form, double average) {}

@ResponseStatus(HttpStatus.NOT_FOUND)
class StudentNotFoundException extends RuntimeException {
    StudentNotFoundException(long id) { super("Student " + id + " not found"); }
}

@Service
class StudentService {
    private final Map<Long, StudentRequest> store = new ConcurrentHashMap<>();
    private final AtomicLong ids = new AtomicLong();

    StudentResponse create(StudentRequest req) {
        long id = ids.incrementAndGet();
        store.put(id, req);
        return toResponse(id, req);
    }

    StudentResponse get(long id) {
        StudentRequest req = store.get(id);
        if (req == null) throw new StudentNotFoundException(id);
        return toResponse(id, req);
    }

    private StudentResponse toResponse(long id, StudentRequest req) {
        List<Integer> scores = req.scores() == null ? List.of() : req.scores();
        double avg = scores.stream().mapToInt(Integer::intValue).average().orElse(0);
        return new StudentResponse(id, req.name(), req.form(), Math.round(avg * 10) / 10.0);
    }
}

@RestController
@RequestMapping("/api/students")
class StudentController {
    private final StudentService service;

    StudentController(StudentService service) {   // constructor injection
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    StudentResponse create(@Valid @RequestBody StudentRequest request) {
        return service.create(request);
    }

    @GetMapping("/{id}")
    StudentResponse get(@PathVariable long id) {
        return service.get(id);
    }
}
`,
        },
        {
          filename: "src/test/java/tz/dolese/results/StudentControllerTest.java",
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
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class StudentControllerTest {
    @Autowired MockMvc mvc;

    @Test
    void createsAndFetchesStudent() throws Exception {
        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"Amina\\",\\"form\\":4,\\"scores\\":[80,90]}"))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.average").value(85.0));

        mvc.perform(get("/api/students/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Amina"));
    }

    @Test
    void rejectsInvalidInputAndUnknownIds() throws Exception {
        mvc.perform(post("/api/students").contentType(MediaType.APPLICATION_JSON)
                .content("{\\"name\\":\\"\\",\\"form\\":9}"))
            .andExpect(status().isBadRequest());

        mvc.perform(get("/api/students/999")).andExpect(status().isNotFound());
    }
}
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
mvn test
mvn spring-boot:run
curl -X POST localhost:8080/api/students -H "Content-Type: application/json" \\
     -d '{"name":"Amina","form":4,"scores":[80,90]}'
`,
        },
      ],
      keyPoints: [
        "`@RestController` + mapping annotations turn methods into endpoints.",
        "Records + Jakarta Validation + `@Valid` give typed, validated input.",
        "Use constructor injection, map domain exceptions to statuses, and test with MockMvc.",
      ],
      exercise:
        "Add `GET /api/students?form=4`, `PUT /api/students/{id}` and `DELETE /api/students/{id}` with tests. Then replace the in-memory map with Spring Data JDBC or JPA backed by PostgreSQL.",
    },
    springDataJpa,
    {
      slug: "production-jvm",
      title: "Packaging, the JVM & Production",
      summary: "Executable jars, container images, memory and garbage-collection settings, logging and diagnostics.",
      body: [
        "Spring Boot's Maven plugin builds a single executable jar (`java -jar app.jar`). Ship it in a small container image built in two stages, running as a non-root user. Configure the app with environment variables, never hard-coded secrets.",
        "In containers, size the heap relative to the container's memory with `-XX:MaxRAMPercentage` rather than fixed `-Xmx` values. The default G1 garbage collector suits most services; ZGC (`-XX:+UseZGC`) keeps pauses tiny for very large heaps.",
        "The JDK ships powerful diagnostics: `jcmd` lists JVMs and dumps threads, Java Flight Recorder (JFR) records low-overhead production profiles, and `System.Logger` (or SLF4J with Logback, Spring's default) produces structured logs. Expose health checks — Spring Boot Actuator adds `/actuator/health` — and handle shutdown gracefully.",
      ],
      code: [
        {
          filename: "Dockerfile",
          lang: "dockerfile",
          source: `
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
RUN useradd --system --uid 1001 app
COPY --from=build /app/target/*.jar app.jar
USER app
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
ENTRYPOINT ["java", "-jar", "app.jar"]
`,
        },
        {
          filename: "Diagnostics.java",
          lang: "java",
          source: `
import java.lang.management.ManagementFactory;

public class Diagnostics {
    private static final System.Logger LOG = System.getLogger("results-api");

    public static void main(String[] args) throws Exception {
        Runtime rt = Runtime.getRuntime();
        LOG.log(System.Logger.Level.INFO, "JVM {0}, {1} CPUs, max heap {2} MB",
            Runtime.version(), rt.availableProcessors(), rt.maxMemory() / 1024 / 1024);
        LOG.log(System.Logger.Level.INFO, "GC: {0}",
            ManagementFactory.getGarbageCollectorMXBeans().stream().map(b -> b.getName()).toList());

        Runtime.getRuntime().addShutdownHook(new Thread(() ->
            LOG.log(System.Logger.Level.INFO, "Shutting down: closing pools, finishing requests")));

        long before = rt.totalMemory() - rt.freeMemory();
        var garbage = new java.util.ArrayList<byte[]>();
        for (int i = 0; i < 200; i++) garbage.add(new byte[1024 * 1024]);
        long during = rt.totalMemory() - rt.freeMemory();
        garbage = null;
        System.gc();
        long after = rt.totalMemory() - rt.freeMemory();
        LOG.log(System.Logger.Level.INFO, "Used heap MB: before {0}, during {1}, after GC {2}",
            before >> 20, during >> 20, after >> 20);
    }
}
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
java -XX:MaxRAMPercentage=75 -XX:+UseG1GC Diagnostics.java

# Inspect a running JVM
jcmd                                   # list Java processes
jcmd <pid> Thread.print                # thread dump (find deadlocks / stuck requests)
jcmd <pid> GC.heap_info

# Record a 60-second production profile with Java Flight Recorder
jcmd <pid> JFR.start duration=60s filename=recording.jfr
jfr print --events jdk.GCPhasePause recording.jfr | head

docker build -t results-api . && docker run -p 8080:8080 -m 512m results-api
`,
        },
      ],
      keyPoints: [
        "Ship an executable jar in a two-stage, non-root container image.",
        "Size the heap with `MaxRAMPercentage` in containers; G1 by default, ZGC for low pauses.",
        "Use `jcmd`, JFR and structured logs to diagnose problems in production.",
      ],
      exercise:
        "Package the Spring Boot API from the previous lesson as a jar and a Docker image, add Spring Boot Actuator, run the container with a 512 MB memory limit, and capture a 30-second JFR recording while sending it requests.",
    },
    projectResultsPortal,
  ],
};
