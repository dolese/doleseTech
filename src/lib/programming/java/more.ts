import type { Lesson } from "../types";

// Lessons added after the first release; inserted into their levels in
// beginner.ts / intermediate.ts / advanced.ts.

const JPA = "src/main/java/tz/dolese/results";
const JPA_TEST = "src/test/java/tz/dolese/results";

export const readingInput: Lesson = {
  slug: "reading-input",
  title: "Reading Input with Scanner",
  summary: "Read what the user types with Scanner, validate it, keep asking until it's right, and format output with printf.",
  body: [
    "Programs become interactive when they read input. `Scanner in = new Scanner(System.in)` reads from the keyboard (or from a file piped into the program). Create one Scanner for the whole program. Reading whole lines with `nextLine()` and converting them yourself is the most predictable approach: mixing `nextInt()` with `nextLine()` leaves the end of the line behind and causes confusing skipped inputs.",
    "People type anything, so never trust input. `Integer.parseInt` throws `NumberFormatException` for text like \"4x\": catch it and ask again. A helper method such as `askInt(in, prompt, min, max)` that loops until the value is valid keeps `main` readable. `hasNextLine()` returns false when the input ends (Ctrl+D, or the end of a piped file), so check it instead of crashing.",
    "`System.out.printf` formats output: `%d` for whole numbers, `%.1f` for one decimal place, `%s` for text, `%-15s` to left-align in 15 characters, `%,d` for thousands separators and `%n` for a new line. Testing with piped input (`printf '...' | java Scores.java`) lets you try many cases quickly without typing them each time.",
  ],
  code: [
    {
      filename: "Scores.java",
      lang: "java",
      source: `
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Scores {
    public static void main(String[] args) {
        // One Scanner for System.in, for the whole program
        Scanner in = new Scanner(System.in);
        List<String> names = new ArrayList<>();
        List<Integer> scores = new ArrayList<>();

        System.out.println("Enter name and score per line, e.g. 'Amina 88'. Empty line to finish.");
        while (in.hasNextLine()) {
            String line = in.nextLine().trim();
            if (line.isEmpty()) break;

            int space = line.lastIndexOf(' ');
            if (space < 1) {
                System.out.println("  Please type a name, a space and a score.");
                continue;
            }
            String name = line.substring(0, space).trim();
            String scoreText = line.substring(space + 1);
            try {
                int score = Integer.parseInt(scoreText);
                if (score < 0 || score > 100) {
                    System.out.println("  Score must be 0-100.");
                    continue;
                }
                names.add(name);
                scores.add(score);
            } catch (NumberFormatException e) {
                System.out.println("  '" + scoreText + "' is not a whole number.");
            }
        }

        if (scores.isEmpty()) {
            System.out.println("No scores entered.");
            return;
        }
        int best = 0;
        double total = 0;
        for (int i = 0; i < scores.size(); i++) {
            total += scores.get(i);
            if (scores.get(i) > scores.get(best)) best = i;
        }
        System.out.printf("%d students, average %.1f, top: %s (%d)%n",
                scores.size(), total / scores.size(), names.get(best), scores.get(best));
    }
}
`,
    },
    {
      filename: "Ages.java",
      lang: "java",
      source: `
import java.util.Scanner;

public class Ages {
    // Keep asking until the user types a valid whole number in range.
    static int askInt(Scanner in, String prompt, int min, int max) {
        while (true) {
            System.out.print(prompt);
            if (!in.hasNextLine()) throw new IllegalStateException("no more input");
            String text = in.nextLine().trim();
            try {
                int value = Integer.parseInt(text);
                if (value >= min && value <= max) return value;
            } catch (NumberFormatException ignored) {
                // fall through to the message below
            }
            System.out.printf("Please enter a number from %d to %d.%n", min, max);
        }
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        System.out.print("Your name: ");
        String name = in.nextLine().trim();
        int year = askInt(in, "Year you were born: ", 1900, 2026);
        System.out.printf("Hello %s, you turn %d in 2026.%n", name, 2026 - year);
    }
}
`,
    },
    {
      filename: "Terminal",
      lang: "bash",
      source: `
java Scores.java                     # type lines, then an empty line
# Or feed a file of test input instead of typing:
printf 'Amina Hassan 88\\nJuma 4x\\nNeema Kimaro 71\\n\\n' | java Scores.java
`,
    },
  ],
  keyPoints: [
    "One `Scanner` on `System.in`; read lines with `nextLine()` and convert them yourself.",
    "Catch `NumberFormatException`, check ranges, and loop until the input is valid.",
    "Format output with `printf` (`%d`, `%.1f`, `%-15s`, `%,d`, `%n`).",
  ],
  exercise:
    "Build a menu program: 1) add a student (name and score, re-asking until valid), 2) list all students in neat columns, 3) show the count, average, highest and lowest score, 4) quit. It must not crash on bad input or when the input ends.",
};

export const datesAndTimes: Lesson = {
  slug: "dates-and-times",
  title: "Dates & Times with java.time",
  summary: "LocalDate, Period, ChronoUnit, formatting and parsing, time zones with ZonedDateTime, and Duration.",
  body: [
    "`java.time` (Java 8+) is the modern date and time API, and its objects are immutable. `LocalDate` is a calendar date with no time or zone, ideal for birthdays, deadlines and exam days. Months are 1 to 12 here, unlike older APIs. Arithmetic methods such as `plusWeeks` and `plusMonths` return a new date, and month arithmetic clamps sensibly: 31 January plus one month is 28 February.",
    "`ChronoUnit.DAYS.between(a, b)` counts days; `Period.between` gives years, months and days, which is how you compute an age. `DateTimeFormatter.ofPattern(\"dd/MM/yyyy\")` parses and formats dates the way people write them, and parsing is strict: 2026-02-31 throws `DateTimeParseException` instead of quietly becoming March. `TemporalAdjusters` find dates such as the first Monday of a month.",
    "For a moment in time, use `ZonedDateTime` (a moment in a place, such as `Africa/Dar_es_Salaam`) or `Instant` (a moment in UTC, ideal for storing and logging). `withZoneSameInstant` shows the same moment in another zone. `Duration` measures elapsed time in hours, minutes and seconds.",
  ],
  code: [
    {
      filename: "Dates.java",
      lang: "java",
      source: `
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.Period;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.Locale;

public class Dates {
    public static void main(String[] args) {
        // A LocalDate is a calendar date with no time and no time zone. Months are 1-12.
        LocalDate registered = LocalDate.of(2026, 3, 14);
        LocalDate exams = LocalDate.parse("2026-11-02");              // ISO format
        System.out.println(ChronoUnit.DAYS.between(registered, exams) + " days until exams");   // 233

        // Objects are immutable: plusWeeks returns a new date
        LocalDate deadline = registered.plusWeeks(6);
        var pretty = DateTimeFormatter.ofPattern("EEEE d MMMM yyyy", Locale.UK);
        System.out.println("Fee deadline: " + deadline.format(pretty));          // Saturday 25 April 2026

        // Month arithmetic clamps to the end of the month
        System.out.println(LocalDate.of(2026, 1, 31).plusMonths(1));             // 2026-02-28

        // Age with Period: years, months and days between two dates
        LocalDate born = LocalDate.parse("14/03/2008", DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        Period age = Period.between(born, LocalDate.of(2026, 10, 5));
        System.out.printf("Age: %d years, %d months, %d days%n", age.getYears(), age.getMonths(), age.getDays());

        // Strict parsing rejects dates that don't exist
        try {
            LocalDate.parse("2026-02-31");
        } catch (DateTimeParseException e) {
            System.out.println("Invalid: " + e.getParsedString());
        }

        // Adjusters find dates for you: the first Monday in July
        LocalDate termStart = LocalDate.of(2026, 7, 1).with(TemporalAdjusters.firstInMonth(DayOfWeek.MONDAY));
        System.out.println("Term starts " + termStart + " (" + termStart.getDayOfWeek() + ")");

        // Time zones: ZonedDateTime for a moment in a place, Instant for a moment in UTC
        ZoneId eat = ZoneId.of("Africa/Dar_es_Salaam");
        ZonedDateTime paid = ZonedDateTime.of(LocalDateTime.of(registered, LocalTime.of(9, 30)), eat);
        Instant instant = paid.toInstant();
        System.out.println(paid + " = " + instant);                             // ...+03:00[...] = ...06:30:00Z
        System.out.println("In London: " + paid.withZoneSameInstant(ZoneId.of("Europe/London")).toLocalTime());

        // Durations measure elapsed time
        Duration exam = Duration.between(LocalTime.of(8, 0), LocalTime.of(10, 30));
        System.out.println("Paper length: " + exam.toHours() + "h " + exam.toMinutesPart() + "m");
    }
}
`,
    },
  ],
  keyPoints: [
    "`LocalDate` for dates, `ZonedDateTime`/`Instant` for moments; all are immutable.",
    "`ChronoUnit.between` and `Period.between` measure gaps; `plusMonths` clamps to the month's end.",
    "`DateTimeFormatter` parses strictly and formats for people.",
  ],
  exercise:
    "Print a fee plan: split TSh 250,000 into 3 monthly instalments starting 31 January 2026, as whole shillings (the last one takes the remainder). Due dates that fall on a Saturday or Sunday move to the next Monday. Print each date like \"Mon 2 Feb 2026\" with the amount, then the total.",
};

export const equalityAndOrdering: Lesson = {
  slug: "equals-hashcode-comparable",
  title: "equals, hashCode & Comparable",
  summary: "Object identity vs equality, the equals/hashCode contract, natural ordering with Comparable and custom orders with Comparator.",
  body: [
    "`==` asks \"is this the same object?\"; `equals` asks \"do these mean the same thing?\". By default a class inherits `equals` from `Object`, which is just `==`, so two `Student` objects with the same admission number are different and a `HashSet` keeps both. Override `equals` to compare the fields that define identity. Always compare strings with `equals`, never `==`.",
    "The contract: if `a.equals(b)`, then `a.hashCode() == b.hashCode()`. Hash-based collections (`HashSet`, `HashMap`) find the bucket by hash code first, so breaking the contract makes equal keys impossible to find. Base both methods on the same fields, ideally fields that never change (`Objects.hash(...)` helps). Records generate correct `equals`, `hashCode` and `toString` automatically from their components.",
    "`Comparable<T>` gives a class its natural order (`compareTo` returns negative, zero or positive), used by `TreeSet`, `TreeMap` and `Collections.sort`. Keep it consistent with `equals`. For any other order, pass a `Comparator`, such as `Comparator.comparingInt(Student::form).reversed().thenComparing(Student::name)`, which leaves the class unchanged.",
  ],
  code: [
    {
      filename: "Equality.java",
      lang: "java",
      source: `
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.TreeSet;

public class Equality {
    // Without equals/hashCode, two objects are "equal" only if they are the same object.
    static class PlainStudent {
        final String admission;
        PlainStudent(String admission) { this.admission = admission; }
    }

    // Identity = admission number. Name and form can change; the admission number cannot.
    static final class Student implements Comparable<Student> {
        private final String admission;
        private String name;
        private int form;

        Student(String admission, String name, int form) {
            this.admission = Objects.requireNonNull(admission);
            this.name = name;
            this.form = form;
        }

        String name() { return name; }
        int form() { return form; }

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof Student other)) return false;
            return admission.equals(other.admission);
        }

        @Override
        public int hashCode() {
            return admission.hashCode();          // equal objects MUST have equal hash codes
        }

        // Natural order: by admission number. Keep it consistent with equals.
        @Override
        public int compareTo(Student other) {
            return admission.compareTo(other.admission);
        }

        @Override
        public String toString() {
            return admission + " " + name + " (Form " + form + ")";
        }
    }

    public static void main(String[] args) {
        var a = new PlainStudent("ADM-001");
        var b = new PlainStudent("ADM-001");
        System.out.println("plain: " + a.equals(b) + ", set size " + new HashSet<>(List.of(a, b)).size());   // false, 2

        var amina = new Student("ADM-001", "Amina Hassan", 4);
        var aminaAgain = new Student("ADM-001", "Amina H.", 4);
        System.out.println("student: " + amina.equals(aminaAgain) + ", same object: " + (amina == aminaAgain));

        Set<Student> registered = new HashSet<>(List.of(amina, aminaAgain, new Student("ADM-007", "Juma Said", 3)));
        System.out.println("set size " + registered.size());                                  // 2

        Map<Student, Integer> fees = new HashMap<>();
        fees.put(amina, 150_000);
        System.out.println("fee found by an equal key: " + fees.get(aminaAgain));             // 150000

        // Natural order (Comparable) and other orders (Comparator)
        List<Student> students = new ArrayList<>(List.of(
                new Student("ADM-009", "Neema Kimaro", 4),
                new Student("ADM-002", "Ali Mohamed", 3),
                amina));
        System.out.println(new TreeSet<>(students));                                          // sorted by admission

        students.sort(Comparator.comparingInt(Student::form).reversed().thenComparing(Student::name));
        System.out.println(students);                                                         // form desc, then name

        // Strings: always compare contents with equals, never ==
        String typed = new String("Maths");
        System.out.println(("Maths" == typed) + " " + "Maths".equals(typed) + " " + "maths".equalsIgnoreCase(typed));
    }
}
`,
    },
  ],
  keyPoints: [
    "`==` is identity; override `equals` for meaning and always compare strings with `equals`.",
    "Equal objects must have equal hash codes; base both on the same unchanging fields.",
    "`Comparable` defines the natural order; `Comparator` chains any other order.",
  ],
  exercise:
    "Write an `Exam` class whose identity is subject + term and use it as a `HashMap` key for lists of results. Rank the entries by score (highest first, then name) with tied scores sharing a position (1, 2, 2, 4). Then show that a key whose `hashCode` changes after being added to a `HashSet` can no longer be found.",
};

export const regexAndText: Lesson = {
  slug: "regex-and-text",
  title: "Regular Expressions & Text Processing",
  summary: "Pattern and Matcher, matches vs find, named groups, replaceAll, split, StringBuilder and text blocks.",
  body: [
    "`Pattern.compile` turns a regular expression into a reusable, thread-safe object; store it in a `static final` field. In Java strings every backslash is doubled, so the regex `\\d{8}` is written `\"\\\\d{8}\"`. `matcher.matches()` requires the whole string to match (ideal for validation), while `matcher.find()` moves to the next match anywhere in the text. Named groups `(?<score>\\d+)` are read with `m.group(\"score\")`.",
    "`replaceAll` rewrites every match using `$1`-style group references, and since Java 9 it also accepts a function that computes each replacement. `split` takes a regex, so `\"\\\\s*[;,]\\\\s*\"` splits on commas or semicolons with any spaces around them. `strip`, `repeat`, `lines` and `String.join` handle everyday text work without regexes.",
    "Building a string with `+` inside a loop copies the text every time; `StringBuilder` appends efficiently. Text blocks (`\"\"\"`) write multi-line strings without `\\n` escapes, and `formatted(...)` fills them in like `printf`.",
  ],
  code: [
    {
      filename: "TextTools.java",
      lang: "java",
      source: `
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TextTools {
    // Compile patterns once and reuse them: Pattern objects are immutable and thread-safe.
    private static final Pattern PHONE = Pattern.compile("(?:\\\\+255|0)([67]\\\\d{8})");
    private static final Pattern RESULT = Pattern.compile("(?<name>[A-Z][a-z]+)(?: scored)? (?<score>\\\\d+) in (?<subject>\\\\w+)");

    public static void main(String[] args) {
        for (String raw : List.of("0712345678", "+255754000111", "0812345678")) {
            Matcher m = PHONE.matcher(raw);
            System.out.printf("%-15s %s%n", raw, m.matches() ? "valid -> 0" + m.group(1) : "invalid");   // matches() = whole string
        }

        String text = "Amina scored 88 in Maths, Juma 42 in Maths and Neema 71 in Biology.";
        Matcher m = RESULT.matcher(text);
        while (m.find()) {                                                    // find() = next match anywhere
            System.out.println(m.group("name") + " " + m.group("subject") + " " + Integer.parseInt(m.group("score")));
        }

        // replaceAll with $1 references, or with a function of each match (Java 9+)
        System.out.println("0712345678".replaceAll("(\\\\d{4})(\\\\d{3})(\\\\d{3})", "$1 $2 $3"));
        System.out.println(Pattern.compile("\\\\d+").matcher(text)
                .replaceAll(r -> Integer.parseInt(r.group()) >= 50 ? r.group() : r.group() + " (fail)"));

        // split, join and whitespace clean-up
        String[] subjects = "Maths; Biology ,Chemistry;Physics".split("\\\\s*[;,]\\\\s*");
        System.out.println(String.join(" | ", subjects));
        System.out.println("  Juma   Said  ".strip().replaceAll("\\\\s+", " "));

        // StringBuilder for building text in a loop (String + in a loop copies every time)
        StringBuilder csv = new StringBuilder("name,score\\n");
        for (String line : List.of("Amina,88", "Juma,42")) csv.append(line).append('\\n');
        System.out.print(csv);

        // Text blocks (Java 15+) and formatted()
        String letter = """
                Dear %s,
                Your child scored %d in %s.
                """.formatted("Mama Amina", 88, "Maths");
        System.out.print(letter);
    }
}
`,
    },
  ],
  keyPoints: [
    "Compile patterns once; `matches()` validates the whole string, `find()` searches.",
    "Named groups, `replaceAll` (with `$1` or a function) and regex `split` cover most parsing.",
    "Use `StringBuilder` in loops and text blocks for multi-line text.",
  ],
  exercise:
    "Parse lines like `ADM-2026-0001 : Amina Hassan : 88` into records `(admission, year, name, score)` with named groups. Reject bad admission numbers, scores above 100 and unreadable lines with a clear message for each, collected in a `StringBuilder`. Then convert dates like 02/11/2026 in a notice to ISO format with `replaceAll`.",
};

export const springDataJpa: Lesson = {
  slug: "spring-data-jpa",
  title: "Spring Data JPA with PostgreSQL",
  summary: "Map entities to tables, let Flyway own the schema, write repositories with derived and JPQL queries, and use transactions.",
  body: [
    "JPA (implemented by Hibernate) maps Java classes to tables: an `@Entity` is a row, fields are columns, and relationships such as `@OneToMany`/`@ManyToOne` become foreign keys. Spring Data JPA goes further: you declare a repository interface and Spring writes the implementation, including queries derived from method names like `findByForm` or `findByNameContainingIgnoreCase`. This continues the Spring Boot lesson's `results-api` project; keep its `ResultsApplication` class.",
    "Let Flyway own the schema: versioned SQL files in `db/migration` (`V1__...sql`, `V2__...sql`) run once each, in order, on every database, and `ddl-auto=validate` makes Hibernate check that the entities match. Never edit a migration that has already run; add a new one. For queries that don't fit a method name, write JPQL with `@Query`, which works on entities and fields, and use `@EntityGraph` or a `join fetch` to load related rows in one query instead of N+1 queries.",
    "`@Transactional` service methods run in one transaction: everything commits together or rolls back on an exception. Inside a transaction, changes to loaded entities are saved automatically at commit, so updating a score needs no `save` call. Tests here are `@SpringBootTest` + `@Transactional` against a separate PostgreSQL test database, and each test is rolled back automatically.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
createdb results_jpa          # for running the app
createdb results_jpa_test     # for the tests (kept separate from your data)
mvn test                      # Flyway migrates the test database, then the tests run
mvn spring-boot:run
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
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
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
      filename: "src/main/resources/application.properties",
      lang: "text",
      source: `
spring.datasource.url=\${DATABASE_URL:jdbc:postgresql://localhost:5432/results_jpa}
spring.datasource.username=\${DATABASE_USER:postgres}
spring.datasource.password=\${DATABASE_PASSWORD:postgres}

# Flyway creates and upgrades the schema; Hibernate only checks that the entities match it.
spring.jpa.hibernate.ddl-auto=validate
# Don't keep a database connection open while the web response is being written.
spring.jpa.open-in-view=false
# Uncomment to see the SQL Hibernate runs:
# spring.jpa.show-sql=true
`,
    },
    {
      filename: "src/main/resources/db/migration/V1__create_students_and_results.sql",
      lang: "sql",
      source: `
CREATE TABLE students (
  id               bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  admission_number text NOT NULL UNIQUE,
  name             text NOT NULL,
  form             integer NOT NULL CHECK (form BETWEEN 1 AND 6)
);

CREATE TABLE exam_results (
  id         bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  student_id bigint NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject    text NOT NULL,
  term       text NOT NULL,
  score      integer NOT NULL CHECK (score BETWEEN 0 AND 100),
  UNIQUE (student_id, subject, term)
);
`,
    },
    {
      filename: `${JPA}/Student.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_number", nullable = false, unique = true)
    private String admissionNumber;

    @Column(nullable = false)
    private String name;

    private int form;

    // One student has many results; mappedBy names the field that owns the foreign key.
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamResult> results = new ArrayList<>();

    protected Student() {}                 // JPA needs a no-argument constructor

    public Student(String admissionNumber, String name, int form) {
        this.admissionNumber = admissionNumber;
        this.name = name;
        this.form = form;
    }

    // Keep both sides of the relationship in step.
    public ExamResult addResult(String subject, String term, int score) {
        ExamResult result = new ExamResult(this, subject, term, score);
        results.add(result);
        return result;
    }

    public Long getId() { return id; }
    public String getAdmissionNumber() { return admissionNumber; }
    public String getName() { return name; }
    public int getForm() { return form; }
    public void setForm(int form) { this.form = form; }
    public List<ExamResult> getResults() { return results; }
}
`,
    },
    {
      filename: `${JPA}/ExamResult.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "exam_results")
public class ExamResult {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)     // loaded only when you use it
    @JoinColumn(name = "student_id")
    private Student student;

    private String subject;
    private String term;
    private int score;

    protected ExamResult() {}

    ExamResult(Student student, String subject, String term, int score) {
        this.student = student;
        this.subject = subject;
        this.term = term;
        this.score = score;
    }

    public Student getStudent() { return student; }
    public String getSubject() { return subject; }
    public String getTerm() { return term; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
}
`,
    },
    {
      filename: `${JPA}/StudentAverage.java`,
      lang: "java",
      source: `
package tz.dolese.results;

public record StudentAverage(String name, double average) {}
`,
    },
    {
      filename: `${JPA}/StudentRepository.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

// Spring writes the implementation: save, findById, findAll, delete, count ... plus these.
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Derived query: Spring builds the SQL from the method name.
    List<Student> findByForm(int form, Sort sort);

    Optional<Student> findByAdmissionNumber(String admissionNumber);

    List<Student> findByNameContainingIgnoreCase(String text);

    // Load students AND their results in one query, avoiding the "N+1 queries" problem.
    @EntityGraph(attributePaths = "results")
    List<Student> findWithResultsByForm(int form);

    // JPQL works on entities and fields, not tables and columns.
    @Query("""
            select new tz.dolese.results.StudentAverage(s.name, avg(r.score))
            from Student s join s.results r
            where s.form = :form and r.term = :term
            group by s.id, s.name
            order by avg(r.score) desc
            """)
    List<StudentAverage> averages(int form, String term);
}
`,
    },
    {
      filename: `${JPA}/ResultService.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import java.util.NoSuchElementException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResultService {
    private final StudentRepository students;

    public ResultService(StudentRepository students) {
        this.students = students;
    }

    // One transaction: everything below commits together, or rolls back on an exception.
    // Changes to loaded entities are saved automatically at commit ("dirty checking").
    @Transactional
    public ExamResult record(String admissionNumber, String subject, String term, int score) {
        Student student = students.findByAdmissionNumber(admissionNumber)
                .orElseThrow(() -> new NoSuchElementException("No student " + admissionNumber));
        for (ExamResult existing : student.getResults()) {
            if (existing.getSubject().equals(subject) && existing.getTerm().equals(term)) {
                existing.setScore(score);           // correction: UPDATE, no save() call needed
                return existing;
            }
        }
        return student.addResult(subject, term, score);   // new row, saved through the cascade
    }
}
`,
    },
    {
      filename: "src/test/resources/application.properties",
      lang: "text",
      source: `
# Tests use their own database, so they never touch (or depend on) development data.
spring.datasource.url=\${TEST_DATABASE_URL:jdbc:postgresql://localhost:5432/results_jpa_test}
spring.datasource.username=\${DATABASE_USER:postgres}
spring.datasource.password=\${DATABASE_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
`,
    },
    {
      filename: `${JPA_TEST}/StudentRepositoryTest.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.NoSuchElementException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

// Runs against a real PostgreSQL database; @Transactional rolls each test back afterwards.
@SpringBootTest
@Transactional
class StudentRepositoryTest {
    @Autowired StudentRepository students;
    @Autowired ResultService results;

    @BeforeEach
    void seed() {
        Student amina = new Student("ADM-2026-0001", "Amina Hassan", 4);
        amina.addResult("Maths", "2026-T1", 88);
        amina.addResult("Biology", "2026-T1", 79);
        Student juma = new Student("ADM-2026-0002", "Juma Said", 4);
        juma.addResult("Maths", "2026-T1", 29);
        students.save(amina);
        students.save(juma);
        students.save(new Student("ADM-2026-0003", "Neema Kimaro", 3));
    }

    @Test
    void derivedQueries() {
        assertThat(students.findByForm(4, Sort.by("name")))
                .extracting(Student::getName).containsExactly("Amina Hassan", "Juma Said");
        assertThat(students.findByAdmissionNumber("ADM-2026-0003")).get()
                .extracting(Student::getForm).isEqualTo(3);
        assertThat(students.findByNameContainingIgnoreCase("SAID")).hasSize(1);
    }

    @Test
    void averagesWithJpql() {
        assertThat(students.averages(4, "2026-T1")).containsExactly(
                new StudentAverage("Amina Hassan", 83.5),
                new StudentAverage("Juma Said", 29.0));
    }

    @Test
    void recordingTwiceUpdatesInsteadOfDuplicating() {
        results.record("ADM-2026-0002", "Maths", "2026-T1", 35);
        results.record("ADM-2026-0002", "Biology", "2026-T1", 48);
        students.flush();
        Student juma = students.findByAdmissionNumber("ADM-2026-0002").orElseThrow();
        assertThat(juma.getResults()).extracting(ExamResult::getSubject, ExamResult::getScore)
                .containsExactlyInAnyOrder(org.assertj.core.groups.Tuple.tuple("Maths", 35),
                        org.assertj.core.groups.Tuple.tuple("Biology", 48));
        assertThatThrownBy(() -> results.record("ADM-9999", "Maths", "2026-T1", 50))
                .isInstanceOf(NoSuchElementException.class);
    }
}
`,
    },
  ],
  keyPoints: [
    "Entities map to tables; repositories get CRUD plus derived queries for free.",
    "Flyway migrations own the schema; Hibernate only validates it. Add migrations, never edit them.",
    "`@Transactional` services commit or roll back as a unit, and loaded entities save automatically.",
  ],
  exercise:
    "Add a `V2` migration with a `guardian_phone` column and a CHECK on its format, map it in `Student`, and add repository methods to page through a form (`Page<Student> findByForm(int, Pageable)`), find students with no guardian phone, and promote a whole form with one `@Modifying` UPDATE. Test each one, including the database rejecting a bad phone number.",
};

export const projectResultsPortal: Lesson = {
  slug: "project-results-portal-api",
  title: "Project: Results Portal API",
  summary: "A secured Spring Boot API: users and roles with Spring Security, parent-only access, validated input, rankings with SQL window functions and full MockMvc tests.",
  body: [
    "This project builds on the Spring Data JPA lesson (keep `ResultsApplication`, `ExamResult` and the `V1` migration) and turns it into a results portal: teachers record results and see form rankings, while parents log in to see only their own child's results. A `V2` migration adds the users table and links each student to a parent.",
    "Spring Security protects every endpoint by default. `SecurityConfig` declares the rules (POST results and rankings need the TEACHER role, everything else needs a login), uses HTTP Basic authentication (fine over HTTPS for an API; a real app might use JWT or OAuth2), and stores passwords with a delegating encoder that writes `{bcrypt}` hashes. Users come from the database through a `UserDetailsService`. Object-level rules, a parent seeing only their own child, live in the service, which answers 404 so strangers can't discover which students exist.",
    "Requests are validated with Jakarta Validation on a record DTO, errors are returned as RFC 9457 problem details, and the ranking is a native SQL query using `rank()` mapped to an interface projection. The MockMvc tests log in as each kind of user with `httpBasic(...)` and run against a separate test database, each test rolled back. A `demo` profile seeds sample data for trying the API by hand.",
  ],
  code: [
    {
      filename: "Terminal",
      lang: "bash",
      source: `
createdb results_portal && createdb results_portal_test
mvn test
mvn spring-boot:run -Dspring-boot.run.profiles=demo      # loads the demo users and students

# Parent: own child works, other children are 404, rankings are 403
curl -u mama.amina:familia-yetu-2026 localhost:8080/api/students/1/results
curl -u mama.amina:familia-yetu-2026 localhost:8080/api/students/2/results
curl -u mama.amina:familia-yetu-2026 "localhost:8080/api/forms/4/ranking?term=2026-T1"

# Teacher: record a result and see the ranking
curl -u mwalimu:chalk-and-board-2026 -X POST localhost:8080/api/results -H "Content-Type: application/json" \\
     -d '{"admissionNumber":"ADM-2026-0002","subject":"Maths","term":"2026-T1","score":45}'
curl -u mwalimu:chalk-and-board-2026 "localhost:8080/api/forms/4/ranking?term=2026-T1"
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
  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.1</version>
  </parent>
  <groupId>tz.dolese</groupId>
  <artifactId>results-portal</artifactId>
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
      <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-flyway</artifactId>
    </dependency>
    <dependency>
      <groupId>org.flywaydb</groupId>
      <artifactId>flyway-database-postgresql</artifactId>
    </dependency>
    <dependency>
      <groupId>org.postgresql</groupId>
      <artifactId>postgresql</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.security</groupId>
      <artifactId>spring-security-test</artifactId>
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
      filename: "src/main/resources/application.properties",
      lang: "text",
      source: `
spring.datasource.url=\${DATABASE_URL:jdbc:postgresql://localhost:5432/results_portal}
spring.datasource.username=\${DATABASE_USER:postgres}
spring.datasource.password=\${DATABASE_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
`,
    },
    {
      filename: "src/main/resources/db/migration/V2__users_and_parents.sql",
      lang: "sql",
      source: `
CREATE TABLE app_users (
  username      text PRIMARY KEY,
  password_hash text NOT NULL,
  role          text NOT NULL CHECK (role IN ('TEACHER', 'PARENT'))
);

ALTER TABLE students ADD COLUMN parent_username text REFERENCES app_users(username);
CREATE INDEX students_parent_idx ON students (parent_username);
`,
    },
    {
      filename: `${JPA}/Student.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admission_number", nullable = false, unique = true)
    private String admissionNumber;

    @Column(nullable = false)
    private String name;

    private int form;

    @Column(name = "parent_username")
    private String parentUsername;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ExamResult> results = new ArrayList<>();

    protected Student() {}

    public Student(String admissionNumber, String name, int form, String parentUsername) {
        this.admissionNumber = admissionNumber;
        this.name = name;
        this.form = form;
        this.parentUsername = parentUsername;
    }

    public ExamResult addResult(String subject, String term, int score) {
        ExamResult result = new ExamResult(this, subject, term, score);
        results.add(result);
        return result;
    }

    public Long getId() { return id; }
    public String getAdmissionNumber() { return admissionNumber; }
    public String getName() { return name; }
    public int getForm() { return form; }
    public String getParentUsername() { return parentUsername; }
    public List<ExamResult> getResults() { return results; }
}
`,
    },
    {
      filename: `${JPA}/AppUser.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "app_users")
public class AppUser {
    @Id
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    private String role;                   // "TEACHER" or "PARENT"

    protected AppUser() {}

    public AppUser(String username, String passwordHash, String role) {
        this.username = username;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
}
`,
    },
    {
      filename: `${JPA}/Repositories.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface AppUserRepository extends JpaRepository<AppUser, String> {}

interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByAdmissionNumber(String admissionNumber);

    // A native SQL query when you need PostgreSQL features such as window functions.
    @Query(value = """
            SELECT rank() OVER (ORDER BY avg(r.score) DESC) AS position,
                   s.admission_number AS admissionNumber, s.name AS name,
                   round(avg(r.score), 1) AS average
              FROM students s JOIN exam_results r ON r.student_id = s.id
             WHERE s.form = :form AND r.term = :term
             GROUP BY s.id
             ORDER BY position, s.name
            """, nativeQuery = true)
    List<RankingRow> ranking(int form, String term);
}

// Interface projection: Spring maps each column alias to a getter.
interface RankingRow {
    int getPosition();
    String getAdmissionNumber();
    String getName();
    double getAverage();
}
`,
    },
    {
      filename: `${JPA}/SecurityConfig.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain api(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/results").hasRole("TEACHER")
                .requestMatchers("/api/forms/**").hasRole("TEACHER")
                .anyRequest().authenticated())                       // deny by default
            .httpBasic(Customizer.withDefaults())                    // username + password on every request (HTTPS only!)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .csrf(csrf -> csrf.disable());                           // safe for a stateless API without cookies
        return http.build();
    }

    // Stores "{bcrypt}$2a$10$..." so the hashing algorithm can be upgraded later.
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    UserDetailsService users(AppUserRepository repository) {
        return username -> repository.findById(username)
                .map(u -> User.withUsername(u.getUsername()).password(u.getPasswordHash()).roles(u.getRole()).build())
                .orElseThrow(() -> new UsernameNotFoundException(username));
    }
}
`,
    },
    {
      filename: `${JPA}/Dtos.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

record NewResult(
        @NotBlank String admissionNumber,
        @NotBlank String subject,
        @Pattern(regexp = "\\\\d{4}-T[123]", message = "must look like 2026-T1") String term,
        @Min(0) @Max(100) int score) {}

record ResultView(String subject, String term, int score) {}
`,
    },
    {
      filename: `${JPA}/ResultService.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import java.util.Comparator;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ResultService {
    private final StudentRepository students;

    public ResultService(StudentRepository students) {
        this.students = students;
    }

    @Transactional(readOnly = true)
    public List<ResultView> resultsFor(long studentId, Authentication user) {
        Student student = students.findById(studentId).filter(s -> canView(user, s))
                // Same 404 for "doesn't exist" and "not yours": don't reveal which ids exist.
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
        return student.getResults().stream()
                .map(r -> new ResultView(r.getSubject(), r.getTerm(), r.getScore()))
                .sorted(Comparator.comparing(ResultView::term).thenComparing(ResultView::subject))
                .toList();
    }

    @Transactional
    public ResultView record(NewResult in) {
        Student student = students.findByAdmissionNumber(in.admissionNumber())
                .orElseThrow(() -> new NoSuchElementException("No student " + in.admissionNumber()));
        ExamResult result = student.getResults().stream()
                .filter(r -> r.getSubject().equals(in.subject()) && r.getTerm().equals(in.term()))
                .findFirst()
                .orElseGet(() -> student.addResult(in.subject(), in.term(), in.score()));
        result.setScore(in.score());
        return new ResultView(result.getSubject(), result.getTerm(), result.getScore());
    }

    @Transactional(readOnly = true)
    public List<RankingRow> ranking(int form, String term) {
        return students.ranking(form, term);
    }

    private static boolean canView(Authentication user, Student student) {
        boolean teacher = user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_TEACHER"));
        return teacher || user.getName().equals(student.getParentUsername());
    }
}
`,
    },
    {
      filename: `${JPA}/ResultsController.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import jakarta.validation.Valid;
import java.util.List;
import java.util.NoSuchElementException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ResultsController {
    private final ResultService service;

    public ResultsController(ResultService service) {
        this.service = service;
    }

    @GetMapping("/students/{id}/results")
    List<ResultView> results(@PathVariable long id, Authentication user) {
        return service.resultsFor(id, user);
    }

    @PostMapping("/results")
    @ResponseStatus(HttpStatus.CREATED)
    ResultView record(@Valid @RequestBody NewResult body) {
        return service.record(body);
    }

    @GetMapping("/forms/{form}/ranking")
    List<RankingRow> ranking(@PathVariable int form, @RequestParam String term) {
        return service.ranking(form, term);
    }

    // RFC 9457 problem details: {"status":404,"detail":"Student not found",...}
    @ExceptionHandler(NoSuchElementException.class)
    ProblemDetail notFound(NoSuchElementException e) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, e.getMessage());
    }
}
`,
    },
    {
      filename: `${JPA}/DemoData.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

// Runs only with --spring.profiles.active=demo, and only into an empty database.
@Component
@Profile("demo")
class DemoData implements CommandLineRunner {
    private final AppUserRepository users;
    private final StudentRepository students;
    private final PasswordEncoder encoder;

    DemoData(AppUserRepository users, StudentRepository students, PasswordEncoder encoder) {
        this.users = users;
        this.students = students;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.count() > 0) return;
        users.save(new AppUser("mwalimu", encoder.encode("chalk-and-board-2026"), "TEACHER"));
        users.save(new AppUser("mama.amina", encoder.encode("familia-yetu-2026"), "PARENT"));

        Student amina = new Student("ADM-2026-0001", "Amina Hassan", 4, "mama.amina");
        amina.addResult("Maths", "2026-T1", 88);
        amina.addResult("Biology", "2026-T1", 79);
        Student juma = new Student("ADM-2026-0002", "Juma Said", 4, null);
        juma.addResult("Maths", "2026-T1", 29);
        juma.addResult("Biology", "2026-T1", 48);
        students.save(amina);
        students.save(juma);
    }
}
`,
    },
    {
      filename: "src/test/resources/application.properties",
      lang: "text",
      source: `
# Tests use their own database, so they never touch (or depend on) development data.
spring.datasource.url=\${TEST_DATABASE_URL:jdbc:postgresql://localhost:5432/results_portal_test}
spring.datasource.username=\${DATABASE_USER:postgres}
spring.datasource.password=\${DATABASE_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
`,
    },
    {
      filename: `${JPA_TEST}/ResultsApiTest.java`,
      lang: "java",
      source: `
package tz.dolese.results;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ResultsApiTest {
    @Autowired MockMvc mvc;
    @Autowired AppUserRepository users;
    @Autowired StudentRepository students;
    @Autowired PasswordEncoder encoder;

    Long aminaId;
    Long jumaId;

    @BeforeEach
    void seed() {
        users.save(new AppUser("mwalimu", encoder.encode("chalk"), "TEACHER"));
        users.save(new AppUser("mama.amina", encoder.encode("familia"), "PARENT"));
        Student amina = new Student("ADM-2026-0001", "Amina Hassan", 4, "mama.amina");
        amina.addResult("Maths", "2026-T1", 88);
        amina.addResult("Biology", "2026-T1", 79);
        Student juma = new Student("ADM-2026-0002", "Juma Said", 4, null);
        juma.addResult("Maths", "2026-T1", 29);
        Student ali = new Student("ADM-2026-0003", "Ali Mohamed", 4, null);
        ali.addResult("Maths", "2026-T1", 77);
        ali.addResult("Biology", "2026-T1", 90);
        aminaId = students.save(amina).getId();
        jumaId = students.save(juma).getId();
        students.save(ali);
    }

    @Test
    void requiresLogin() throws Exception {
        mvc.perform(get("/api/students/" + aminaId + "/results")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/students/" + aminaId + "/results").with(httpBasic("mwalimu", "wrong")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void parentSeesOnlyTheirOwnChild() throws Exception {
        mvc.perform(get("/api/students/" + aminaId + "/results").with(httpBasic("mama.amina", "familia")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].subject").value("Biology"));
        mvc.perform(get("/api/students/" + jumaId + "/results").with(httpBasic("mama.amina", "familia")))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Student not found"));
        mvc.perform(get("/api/forms/4/ranking?term=2026-T1").with(httpBasic("mama.amina", "familia")))
                .andExpect(status().isForbidden());
    }

    @Test
    void teacherRecordsAndRanks() throws Exception {
        mvc.perform(post("/api/results").with(httpBasic("mwalimu", "chalk"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"admissionNumber":"ADM-2026-0002","subject":"Maths","term":"2026-T1","score":45}"""))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.score").value(45));

        mvc.perform(get("/api/forms/4/ranking?term=2026-T1").with(httpBasic("mwalimu", "chalk")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Ali Mohamed"))
                .andExpect(jsonPath("$[0].average").value(83.5))
                .andExpect(jsonPath("$[1].position").value(1))
                .andExpect(jsonPath("$[2].name").value("Juma Said"))
                .andExpect(jsonPath("$[2].average").value(45.0));
    }

    @Test
    void rejectsInvalidResults() throws Exception {
        mvc.perform(post("/api/results").with(httpBasic("mwalimu", "chalk"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"admissionNumber":"ADM-2026-0001","subject":"Maths","term":"Term 1","score":120}"""))
                .andExpect(status().isBadRequest());
    }
}
`,
    },
  ],
  keyPoints: [
    "Spring Security: deny by default, role rules in one place, hashed passwords from the database.",
    "Put ownership checks in the service and answer 404 to outsiders.",
    "Validated record DTOs, problem-detail errors and MockMvc tests for every role.",
  ],
  exercise:
    "Add `GET /api/students/{id}/report?term=2026-T1`: the student's name, each subject with score and grade (A ≥ 75, B ≥ 65, C ≥ 45, D ≥ 30, otherwise F), their average and position such as \"2 of 4\" from the ranking query. Use the same parent rule, keep the report building in a pure method, and test it with MockMvc.",
};
