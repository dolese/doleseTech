import type { LevelTrack } from "../types";
import { equalityAndOrdering, regexAndText } from "./more";

export const intermediate: LevelTrack = {
  intro:
    "Write modern, idiomatic Java: design with interfaces and polymorphism, model data with records, enums and sealed types, master the Collections framework and generics, handle exceptions properly, process data with lambdas and streams, and work with files.",
  outcomes: [
    "Design with inheritance, abstract classes and interfaces",
    "Model data with records, enums, sealed interfaces and pattern matching",
    "Use List, Map, Set and generics confidently",
    "Handle exceptions, write stream pipelines and read and write files",
  ],
  lessons: [
    {
      slug: "inheritance-and-interfaces",
      title: "Inheritance, Interfaces & Polymorphism",
      summary: "extends, abstract classes, interfaces with default methods, and polymorphism.",
      body: [
        "Inheritance (`extends`) lets a class reuse and specialise another. An abstract class can't be instantiated and may declare abstract methods that subclasses must implement. Use `super(...)` to call the parent constructor and `@Override` to mark overridden methods.",
        "An interface declares what a type can do, without saying how. A class can implement many interfaces. Interfaces can also provide `default` methods with a shared implementation.",
        "Polymorphism: code that works with the interface or parent type (`Notifier`, `StaffMember`) works with every implementation. This is how you swap an SMS notifier for an email one — or for a fake in tests — without changing the calling code.",
      ],
      code: [
        {
          filename: "Staff.java",
          lang: "java",
          source: `
import java.util.List;

public class Staff {
    public static void main(String[] args) {
        List<StaffMember> staff = List.of(
            new Teacher("Ms. Lyimo", 1_200_000, "Biology"),
            new Teacher("Mr. Mwakyusa", 1_250_000, "Mathematics"),
            new Bursar("Mrs. Mrema", 1_100_000)
        );

        long payroll = 0;
        for (StaffMember m : staff) {
            System.out.println(m.describe());            // each class's own version
            payroll += m.monthlyPay();
        }
        System.out.println("Monthly payroll: " + payroll);

        Notifier sms = new SmsNotifier();
        sms.notifyAll(List.of("0712345678", "0754000111"), "Staff meeting at 14:00");
    }
}

abstract class StaffMember {
    private final String name;
    protected final long salary;

    StaffMember(String name, long salary) {
        this.name = name;
        this.salary = salary;
    }

    String name() { return name; }

    abstract String role();

    long monthlyPay() { return salary; }

    String describe() {
        return name() + " - " + role() + " - " + monthlyPay() + " TSh";
    }
}

class Teacher extends StaffMember {
    private final String subject;

    Teacher(String name, long salary, String subject) {
        super(name, salary);
        this.subject = subject;
    }

    @Override
    String role() { return subject + " teacher"; }

    @Override
    long monthlyPay() { return salary + 100_000; }   // teaching allowance
}

class Bursar extends StaffMember {
    Bursar(String name, long salary) { super(name, salary); }

    @Override
    String role() { return "Bursar"; }
}

interface Notifier {
    void send(String to, String message);

    default void notifyAll(List<String> recipients, String message) {
        for (String r : recipients) send(r, message);
    }
}

class SmsNotifier implements Notifier {
    @Override
    public void send(String to, String message) {
        System.out.println("SMS to " + to + ": " + message);
    }
}
`,
        },
      ],
      keyPoints: [
        "Abstract classes share code; interfaces define capabilities a class can promise.",
        "Program against interfaces/parent types — implementations become swappable.",
        "Always mark overrides with `@Override` so the compiler checks them.",
      ],
      exercise:
        "Create a `Shape` interface with `area()` and `perimeter()`, and `Circle`, `Rectangle` and `Triangle` classes. Store mixed shapes in a `List<Shape>`, print each one and the total area.",
    },
    {
      slug: "records-enums-pattern-matching",
      title: "Records, Enums, Sealed Types & Pattern Matching",
      summary: "Concise data classes, fixed sets of constants, closed type hierarchies and switch patterns.",
      body: [
        "A `record` is a compact, immutable data class: `record Result(String student, int score) {}` gives you a constructor, accessors (`score()`), `equals`, `hashCode` and `toString`. Add validation in a compact constructor.",
        "An `enum` is a fixed set of named constants, which can have fields and methods — perfect for grades, payment methods or statuses.",
        "A `sealed` interface lists exactly which types may implement it. Combined with pattern matching in `switch`, the compiler checks that every case is handled: add a new payment type and every switch that forgot it stops compiling.",
      ],
      code: [
        {
          filename: "Payments.java",
          lang: "java",
          source: `
import java.util.List;

public class Payments {
    public static void main(String[] args) {
        List<Payment> payments = List.of(
            new MobileMoney("0712345678", 150_000),
            new BankTransfer("CRDB", "TX-88231", 300_000),
            new Cash(50_000)
        );

        long total = 0;
        for (Payment p : payments) {
            System.out.println(describe(p));
            total += p.amount();
        }
        System.out.println("Total: " + total);

        for (Grade g : Grade.values()) {
            System.out.println(g + " from " + g.minScore + ": " + g.remark);
        }
        System.out.println(Grade.forScore(68) + " " + Grade.valueOf("A").remark);

        Result r = new Result("Amina", 88);
        System.out.println(r + " " + r.score() + " " + r.equals(new Result("Amina", 88)));
        try {
            new Result("Juma", 120);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }

    static String describe(Payment p) {
        return switch (p) {
            case MobileMoney m -> "Mobile money from " + m.phone() + ": " + m.amount();
            case BankTransfer b when b.amount() >= 250_000 -> "LARGE bank transfer " + b.reference();
            case BankTransfer b -> "Bank transfer via " + b.bank() + ": " + b.amount();
            case Cash c -> "Cash: " + c.amount();
        };   // no default needed: the sealed interface lists every case
    }
}

sealed interface Payment permits MobileMoney, BankTransfer, Cash {
    long amount();
}

record MobileMoney(String phone, long amount) implements Payment {}
record BankTransfer(String bank, String reference, long amount) implements Payment {}
record Cash(long amount) implements Payment {}

record Result(String student, int score) {
    Result {                                    // compact constructor: validation
        if (score < 0 || score > 100) throw new IllegalArgumentException("score " + score);
    }
}

enum Grade {
    A(75, "Excellent"), B(65, "Very good"), C(45, "Good"), D(30, "Satisfactory"), F(0, "Fail");

    final int minScore;
    final String remark;

    Grade(int minScore, String remark) {
        this.minScore = minScore;
        this.remark = remark;
    }

    static Grade forScore(int score) {
        for (Grade g : values()) {
            if (score >= g.minScore) return g;
        }
        return F;
    }
}
`,
        },
      ],
      keyPoints: [
        "Use records for immutable data; validate in the compact constructor.",
        "Enums model fixed sets and can carry data and behaviour.",
        "Sealed types + switch patterns = the compiler guarantees every case is handled.",
      ],
      exercise:
        "Model shapes as a sealed interface with `Circle`, `Rectangle` and `Triangle` records, and compute the area with a pattern-matching switch. Add an `enum Term { ONE, TWO }` and a record `TermResult(String student, Term term, int score)`.",
    },
    {
      slug: "collections",
      title: "The Collections Framework",
      summary: "List, Set, Map and Deque — choosing the right one, iterating, sorting with Comparator.",
      body: [
        "Collections grow and shrink as needed, unlike arrays. `List` keeps order and allows duplicates (`ArrayList`); `Set` keeps unique items (`HashSet`, or `TreeSet` for sorted order); `Map` stores key → value pairs (`HashMap`, `TreeMap` for sorted keys, `LinkedHashMap` for insertion order); `Deque` works as a stack or queue (`ArrayDeque`).",
        "Declare variables by interface (`List<String> names = new ArrayList<>()`) so you can change the implementation later. `List.of(...)` and `Map.of(...)` create unmodifiable collections.",
        "Sort with `Comparator`: `Comparator.comparing(Student::average).reversed().thenComparing(Student::name)`. `Map` methods such as `getOrDefault`, `merge` and `computeIfAbsent` make counting and grouping easy.",
      ],
      code: [
        {
          filename: "CollectionsDemo.java",
          lang: "java",
          source: `
import java.util.*;

public class CollectionsDemo {
    record Student(String name, int form, double average) {}

    public static void main(String[] args) {
        List<Student> students = new ArrayList<>(List.of(
            new Student("Neema", 4, 75.0),
            new Student("Amina", 4, 86.0),
            new Student("Baraka", 3, 54.0),
            new Student("Rehema", 3, 71.3),
            new Student("Juma", 4, 54.0)
        ));

        students.sort(Comparator.comparingDouble(Student::average).reversed()
                                .thenComparing(Student::name));
        students.forEach(s -> System.out.println(s.name() + " " + s.average()));

        Map<Integer, List<String>> byForm = new TreeMap<>();
        for (Student s : students) {
            byForm.computeIfAbsent(s.form(), f -> new ArrayList<>()).add(s.name());
        }
        System.out.println(byForm);            // {3=[Rehema, Baraka], 4=[Amina, Neema, Juma]}

        Map<String, Integer> clubCounts = new HashMap<>();
        for (String club : List.of("debate", "science", "debate", "football", "science", "debate")) {
            clubCounts.merge(club, 1, Integer::sum);
        }
        System.out.println(new TreeMap<>(clubCounts));   // {debate=3, football=1, science=2}

        Set<String> maths = new TreeSet<>(List.of("Amina", "Juma", "Neema"));
        Set<String> biology = Set.of("Amina", "Rehema");
        Set<String> both = new TreeSet<>(maths);
        both.retainAll(biology);
        System.out.println("Both: " + both + ", Maths has Juma? " + maths.contains("Juma"));

        Deque<String> undo = new ArrayDeque<>();      // used as a stack
        undo.push("typed name");
        undo.push("selected form");
        System.out.println("Undo: " + undo.pop() + ", then: " + undo.peek());

        List<String> fixed = List.of("A", "B");
        try {
            fixed.add("C");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of is unmodifiable");
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "List = ordered, Set = unique, Map = key → value, Deque = stack/queue.",
        "Declare by interface type; use `List.of`/`Map.of` for fixed data.",
        "`Comparator.comparing(...).thenComparing(...)` and `Map.merge`/`computeIfAbsent` cover most sorting and grouping.",
      ],
      exercise:
        "Read a list of words (from an array) and print: the number of unique words, the 5 most frequent words with counts (using a `Map` and sorting its entries), and the words grouped by their first letter in a `TreeMap`.",
    },
    equalityAndOrdering,
    {
      slug: "generics",
      title: "Generics",
      summary: "Type-safe reusable classes and methods, bounded types and wildcards.",
      body: [
        "Generics let you write a class or method once and use it with any type while keeping compile-time type checks. `List<String>` only accepts Strings — no casts, and mistakes are caught by the compiler.",
        "Declare type parameters on a class (`class Box<T>`) or a method (`static <T> T firstOrDefault(List<T> list, T fallback)`). Bound them with `extends` when you need certain capabilities: `<T extends Comparable<T>>` can be compared.",
        "Wildcards make APIs flexible: `List<? extends Number>` reads numbers of any subtype; `List<? super Integer>` accepts Integers being added. A handy rule: producer `extends`, consumer `super` (PECS).",
      ],
      code: [
        {
          filename: "GenericsDemo.java",
          lang: "java",
          source: `
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GenericsDemo {
    static class Repository<T, ID> {
        private final List<T> items = new ArrayList<>();
        private final java.util.function.Function<T, ID> idOf;

        Repository(java.util.function.Function<T, ID> idOf) { this.idOf = idOf; }

        void save(T item) { items.add(item); }

        Optional<T> findById(ID id) {
            return items.stream().filter(i -> idOf.apply(i).equals(id)).findFirst();
        }

        List<T> findAll() { return List.copyOf(items); }
    }

    record Pair<A, B>(A first, B second) {}

    record Student(String id, String name, int score) {}

    static <T extends Comparable<T>> T max(List<T> values) {
        T best = values.get(0);
        for (T v : values) if (v.compareTo(best) > 0) best = v;
        return best;
    }

    static double sum(List<? extends Number> numbers) {     // reads Integers, Doubles, ...
        double total = 0;
        for (Number n : numbers) total += n.doubleValue();
        return total;
    }

    static void addDefaults(List<? super Integer> target) {  // accepts List<Integer>, List<Number>, ...
        target.add(0);
        target.add(100);
    }

    public static void main(String[] args) {
        Repository<Student, String> repo = new Repository<>(Student::id);
        repo.save(new Student("S1", "Amina", 88));
        repo.save(new Student("S2", "Juma", 42));

        System.out.println(repo.findById("S2").map(Student::name).orElse("not found"));
        System.out.println(repo.findById("S9").map(Student::name).orElse("not found"));

        Pair<String, Integer> top = new Pair<>("Amina", 88);
        System.out.println(top.first() + " -> " + top.second());

        System.out.println(max(List.of(3, 9, 4)) + " " + max(List.of("Juma", "Amina", "Neema")));
        System.out.println(sum(List.of(1, 2, 3)) + sum(List.of(0.5, 1.5)));

        List<Number> numbers = new ArrayList<>();
        addDefaults(numbers);
        System.out.println(numbers);
    }
}
`,
        },
      ],
      keyPoints: [
        "Generics give reusable code with compile-time type safety — no casts.",
        "Bound type parameters (`<T extends Comparable<T>>`) to use their capabilities.",
        "Wildcards: `? extends T` to read (producer), `? super T` to write (consumer).",
      ],
      exercise:
        "Write a generic `Stack<T>` class with `push`, `pop`, `peek` and `isEmpty` (throw an exception on empty pop). Then write a generic method `<T> Map<T, Integer> frequencies(List<T> items)`.",
    },
    {
      slug: "exceptions",
      title: "Exceptions",
      summary: "Checked vs unchecked exceptions, try / catch / finally, try-with-resources and custom exceptions.",
      body: [
        "Exceptions signal errors. Checked exceptions (such as `IOException`) must be caught or declared with `throws` — the compiler enforces it. Unchecked exceptions (subclasses of `RuntimeException`, such as `IllegalArgumentException`) usually indicate programming errors or invalid input and don't need declaring.",
        "Catch specific exceptions you can handle; let others propagate. Multi-catch (`catch (A | B e)`) handles several types the same way. `finally` always runs.",
        "Try-with-resources (`try (var reader = ...)`) closes files, connections and streams automatically, even when an exception occurs. Define custom exceptions for your domain and keep the original exception as the cause.",
      ],
      code: [
        {
          filename: "Errors.java",
          lang: "java",
          source: `
import java.io.BufferedReader;
import java.io.IOException;
import java.io.StringReader;
import java.util.Map;

public class Errors {
    static class StudentNotFoundException extends RuntimeException {
        StudentNotFoundException(String id) { super("Student " + id + " not found"); }
    }

    static class InvalidScoreException extends Exception {          // checked
        InvalidScoreException(String message, Throwable cause) { super(message, cause); }
    }

    static final Map<String, String> STUDENTS = Map.of("S1", "Amina");

    static String findStudent(String id) {
        String name = STUDENTS.get(id);
        if (name == null) throw new StudentNotFoundException(id);
        return name;
    }

    static int parseScore(String text) throws InvalidScoreException {
        try {
            int score = Integer.parseInt(text.trim());
            if (score < 0 || score > 100) throw new InvalidScoreException("Out of range: " + score, null);
            return score;
        } catch (NumberFormatException e) {
            throw new InvalidScoreException("Not a number: '" + text + "'", e);
        }
    }

    public static void main(String[] args) {
        for (String raw : new String[]{"88", "abc", "150"}) {
            try {
                System.out.println("OK " + parseScore(raw));
            } catch (InvalidScoreException e) {
                System.out.println("Invalid: " + e.getMessage()
                    + (e.getCause() != null ? " (cause: " + e.getCause().getClass().getSimpleName() + ")" : ""));
            } finally {
                System.out.println("  checked " + raw);
            }
        }

        try {
            findStudent("S9");
        } catch (StudentNotFoundException e) {
            System.out.println("404: " + e.getMessage());
        }

        String csv = "Amina,88\\nJuma,42\\n";
        try (BufferedReader reader = new BufferedReader(new StringReader(csv))) {   // closed automatically
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println("Read: " + line);
            }
        } catch (IOException e) {
            System.out.println("Could not read: " + e.getMessage());
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "Checked exceptions must be handled or declared; unchecked ones signal bugs or bad input.",
        "Catch only what you can handle, and keep the cause when wrapping exceptions.",
        "Use try-with-resources for anything that must be closed.",
      ],
      exercise:
        "Write `parseLine(String line)` that turns \"Amina,88\" into a `Result` record, throwing a custom checked `InvalidLineException` for missing commas, blank names or bad scores. Process several lines and report how many failed.",
    },
    {
      slug: "lambdas-and-streams",
      title: "Lambdas, Optional & Streams",
      summary: "Functional interfaces, method references, Optional, and filter / map / collect pipelines.",
      body: [
        "A lambda is a short anonymous function: `s -> s.score() >= 30`. Lambdas implement functional interfaces — interfaces with one abstract method such as `Predicate<T>`, `Function<T, R>`, `Consumer<T>` and `Supplier<T>`. Method references (`Student::name`) are shorthand for lambdas that just call a method.",
        "Streams process collections declaratively: `filter` keeps items, `map` transforms them, `sorted` orders them, and terminal operations such as `toList()`, `count()`, `average()` and `collect(...)` produce a result. `Collectors.groupingBy` builds maps of groups in one step.",
        "`Optional<T>` represents a value that may be absent — returned by `findFirst`, `max` and similar. Use `orElse`, `map` and `ifPresent` instead of returning `null`.",
      ],
      code: [
        {
          filename: "Streams.java",
          lang: "java",
          source: `
import java.util.*;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class Streams {
    record Result(String student, int form, String subject, int score) {}

    public static void main(String[] args) {
        List<Result> results = List.of(
            new Result("Amina", 4, "Maths", 88), new Result("Amina", 4, "Biology", 79),
            new Result("Juma", 4, "Maths", 29),  new Result("Juma", 4, "Biology", 48),
            new Result("Neema", 4, "Maths", 71), new Result("Neema", 4, "Biology", 84),
            new Result("Ali", 3, "Maths", 95),   new Result("Ali", 3, "Biology", 62)
        );

        Predicate<Result> passed = r -> r.score() >= 30;

        List<String> topMaths = results.stream()
            .filter(r -> r.subject().equals("Maths"))
            .sorted(Comparator.comparingInt(Result::score).reversed())
            .limit(3)
            .map(Result::student)
            .toList();
        System.out.println("Top Maths: " + topMaths);

        Map<String, Double> averageByStudent = results.stream()
            .collect(Collectors.groupingBy(Result::student, TreeMap::new,
                     Collectors.averagingInt(Result::score)));
        System.out.println(averageByStudent);

        Map<Boolean, Long> passFail = results.stream()
            .collect(Collectors.partitioningBy(passed, Collectors.counting()));
        System.out.println("Passed: " + passFail.get(true) + ", failed: " + passFail.get(false));

        IntSummaryStatistics stats = results.stream().mapToInt(Result::score).summaryStatistics();
        System.out.printf("min %d, max %d, avg %.1f%n", stats.getMin(), stats.getMax(), stats.getAverage());

        Optional<Result> firstFail = results.stream().filter(passed.negate()).findFirst();
        firstFail.ifPresent(r -> System.out.println("First fail: " + r.student() + " in " + r.subject()));
        System.out.println(results.stream().filter(r -> r.score() > 100).findAny()
            .map(Result::student).orElse("no impossible scores"));

        String csv = results.stream()
            .map(r -> r.student() + ":" + r.score())
            .collect(Collectors.joining(", ", "[", "]"));
        System.out.println(csv);
    }
}
`,
        },
      ],
      keyPoints: [
        "Lambdas and method references implement functional interfaces concisely.",
        "Stream pipelines: source → filter/map/sorted → terminal operation.",
        "Return `Optional` instead of `null` for values that may be missing.",
      ],
      exercise:
        "From the results list, use streams to find: each subject's highest scorer, students who passed every subject, and a `Map<String, List<Integer>>` of student → scores sorted descending.",
    },
    regexAndText,
    {
      slug: "files-and-io",
      title: "Files & I/O with java.nio",
      summary: "Read and write files with Path and Files, process CSV lines, and walk directories.",
      body: [
        "The modern file API lives in `java.nio.file`. A `Path` represents a location; `Files` provides operations: `writeString`, `readString`, `readAllLines`, `lines`, `exists`, `createDirectories`, `list` and `walk`.",
        "For large files, `Files.lines(path)` returns a lazy stream of lines — wrap it in try-with-resources so the file is closed. Always specify `StandardCharsets.UTF_8` when it matters.",
        "Most file operations throw the checked `IOException`; handle it where you can show the user a useful message, or declare `throws IOException` on `main` in small tools.",
      ],
      code: [
        {
          filename: "FilesDemo.java",
          lang: "java",
          source: `
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class FilesDemo {
    public static void main(String[] args) throws IOException {
        Path dir = Path.of("data");
        Files.createDirectories(dir);

        Path csv = dir.resolve("results.csv");
        Files.writeString(csv, """
            name,subject,score
            Amina,Maths,88
            Amina,Biology,79
            Juma,Maths,42
            Neema,Biology,84
            """, StandardCharsets.UTF_8);

        Map<String, Double> averages;
        try (Stream<String> lines = Files.lines(csv, StandardCharsets.UTF_8)) {
            averages = lines.skip(1)
                .map(line -> line.split(","))
                .collect(Collectors.groupingBy(p -> p[0], TreeMap::new,
                         Collectors.averagingInt(p -> Integer.parseInt(p[2]))));
        }
        System.out.println(averages);

        Path report = dir.resolve("report.txt");
        List<String> reportLines = averages.entrySet().stream()
            .map(e -> "%-8s %5.1f".formatted(e.getKey(), e.getValue()))
            .toList();
        Files.write(report, reportLines, StandardCharsets.UTF_8);
        Files.writeString(report, "Generated by FilesDemo\\n", StandardOpenOption.APPEND);

        System.out.print(Files.readString(report));
        System.out.println(Files.size(report) + " bytes, exists=" + Files.exists(report));

        try (Stream<Path> files = Files.list(dir)) {
            System.out.println(files.map(p -> p.getFileName().toString()).sorted().toList());
        }

        try {
            Files.readString(Path.of("missing.txt"));
        } catch (NoSuchFileException e) {
            System.out.println("No such file: " + e.getFile());
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "Use `Path` + `Files` from java.nio.file for file work.",
        "Close streams from `Files.lines`/`Files.list` with try-with-resources.",
        "Handle `IOException` where you can give a helpful message.",
      ],
      exercise:
        "Write a program that reads every `.csv` file in a folder (using `Files.list` and a filter on the file name), combines the results, and writes a `summary.txt` with each student's average and best subject.",
    },
  ],
};
