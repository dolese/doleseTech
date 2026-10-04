import type { Practice } from "../../types";

export const intermediate: Record<string, Practice> = {
  "inheritance-and-interfaces": {
    solution: {
      notes: [
        "The `Shape` interface promises `area()` and `perimeter()`, and gives every shape a shared `describe()` default method. The loop only knows about `Shape` — each object runs its own version of the methods (polymorphism).",
      ],
      code: [
        {
          filename: "Shapes.java",
          lang: "java",
          source: `
import java.util.List;

public class Shapes {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(1), new Rectangle(3, 4), new Triangle(3, 4, 5));
        double total = 0;
        for (Shape s : shapes) {
            System.out.println(s.describe());
            total += s.area();
        }
        System.out.printf("Total area: %.2f%n", total);   // Total area: 21.14
    }
}

interface Shape {
    double area();
    double perimeter();

    default String describe() {
        return String.format("%s: area %.2f, perimeter %.2f", getClass().getSimpleName(), area(), perimeter());
    }
}

class Circle implements Shape {
    private final double r;
    Circle(double r) { this.r = r; }
    public double area() { return Math.PI * r * r; }
    public double perimeter() { return 2 * Math.PI * r; }
}

class Rectangle implements Shape {
    private final double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    public double area() { return w * h; }
    public double perimeter() { return 2 * (w + h); }
}

class Triangle implements Shape {
    private final double a, b, c;
    Triangle(double a, double b, double c) { this.a = a; this.b = b; this.c = c; }
    public double perimeter() { return a + b + c; }
    public double area() {                     // Heron's formula
        double s = perimeter() / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "How many interfaces can a Java class implement?",
        options: ["Exactly one", "None", "Two at most", "As many as it needs"],
        answer: 3,
        explanation: "A class extends one class but can implement many interfaces.",
      },
      {
        question: "What is an abstract class?",
        options: [
          "A class that can't be instantiated and may declare methods subclasses must implement",
          "A class with no methods",
          "A class that can't be extended",
          "A private class",
        ],
        answer: 0,
        explanation: "Abstract classes share code and define what subclasses must provide.",
      },
      {
        question: "Why mark overriding methods with `@Override`?",
        options: [
          "It makes them faster",
          "The compiler checks that the method really overrides one in a parent type",
          "It's required for interfaces only",
          "It makes the method private",
        ],
        answer: 1,
        explanation: "A typo in the method name becomes a compile error instead of a silent bug.",
      },
      {
        question: "What is polymorphism?",
        options: [
          "A class with many fields",
          "Changing a variable's type at runtime",
          "Code written against a parent type working with every subtype, each using its own behaviour",
          "Copying objects",
        ],
        answer: 2,
        explanation: "`for (Shape s : shapes) s.area()` calls each shape's own `area`.",
      },
    ],
  },

  "records-enums-pattern-matching": {
    solution: {
      notes: [
        "The sealed interface lists the three shapes, so the pattern-matching `switch` needs no `default` — add a fourth shape and this code stops compiling until you handle it. The enum and record model term results with no boilerplate.",
      ],
      code: [
        {
          filename: "SealedShapes.java",
          lang: "java",
          source: `
import java.util.List;

public class SealedShapes {
    sealed interface Shape permits Circle, Rectangle, Triangle {}
    record Circle(double radius) implements Shape {}
    record Rectangle(double width, double height) implements Shape {}
    record Triangle(double base, double height) implements Shape {}

    enum Term { ONE, TWO }
    record TermResult(String student, Term term, int score) {}

    static double area(Shape shape) {
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Triangle t -> 0.5 * t.base() * t.height();
        };
    }

    public static void main(String[] args) {
        for (Shape s : List.of(new Circle(1), new Rectangle(3, 4), new Triangle(6, 2))) {
            System.out.printf("%s -> %.2f%n", s, area(s));
        }

        List<TermResult> results = List.of(
            new TermResult("Amina", Term.ONE, 86), new TermResult("Amina", Term.TWO, 89));
        for (TermResult r : results) {
            System.out.println(r.student() + " term " + r.term() + ": " + r.score());
        }
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does a `record` generate automatically?",
        options: [
          "A constructor, accessors, `equals`, `hashCode` and `toString`",
          "Setters for every field",
          "A database table",
          "A main method",
        ],
        answer: 0,
        explanation: "Records are compact, immutable data carriers.",
      },
      {
        question: "Where should a record validate its values?",
        options: ["In a setter", "In `toString`", "In a separate validator class only", "In a compact constructor"],
        answer: 3,
        explanation: "`Result { if (score < 0) throw ...; }` runs on every construction.",
      },
      {
        question: "Why doesn't a switch over a sealed interface need a `default` case?",
        options: [
          "Switches never need defaults",
          "The compiler knows every permitted subtype, so it can check all are handled",
          "Sealed interfaces can't be used in switches",
          "Defaults are added automatically at runtime",
        ],
        answer: 1,
        explanation: "Exhaustiveness is checked at compile time.",
      },
      {
        question: "What can an enum constant carry, as in `A(75, \"Excellent\")`?",
        options: ["Nothing besides its name", "Only an integer", "Fields and methods", "Only strings"],
        answer: 2,
        explanation: "Enums are full classes with a fixed set of instances.",
      },
    ],
  },

  collections: {
    solution: {
      notes: [
        "A `HashMap` counts each word with `merge`. Sorting the map's entries by count (then alphabetically) gives the top five. `computeIfAbsent` on a `TreeMap` groups the unique words by their first letter, with the letters in order.",
      ],
      code: [
        {
          filename: "WordStats.java",
          lang: "java",
          source: `
import java.util.*;

public class WordStats {
    public static void main(String[] args) {
        String text = "the cell is the basic unit of life the cell membrane controls what enters the cell "
                    + "and the nucleus controls the cell";
        String[] words = text.split("\\\\s+");

        Map<String, Integer> counts = new HashMap<>();
        for (String w : words) counts.merge(w, 1, Integer::sum);
        System.out.println("Unique words: " + counts.size());

        List<Map.Entry<String, Integer>> top = new ArrayList<>(counts.entrySet());
        top.sort(Map.Entry.<String, Integer>comparingByValue().reversed()
                     .thenComparing(Map.Entry.comparingByKey()));
        System.out.println("Top 5: " + top.subList(0, 5));

        Map<Character, SortedSet<String>> byLetter = new TreeMap<>();
        for (String w : counts.keySet()) {
            byLetter.computeIfAbsent(w.charAt(0), k -> new TreeSet<>()).add(w);
        }
        System.out.println(byLetter);
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which collection keeps items unique and in sorted order?",
        options: ["`ArrayList`", "`HashSet`", "`TreeSet`", "`ArrayDeque`"],
        answer: 2,
        explanation: "`HashSet` is unique but unordered; `TreeSet` keeps natural order.",
      },
      {
        question: "Why declare `List<String> names = new ArrayList<>()` rather than `ArrayList<String> names`?",
        options: [
          "So you can change the implementation later without changing other code",
          "ArrayList can't be a variable type",
          "It's faster",
          "It makes the list read-only",
        ],
        answer: 0,
        explanation: "Program to the interface.",
      },
      {
        question: "What happens when you call `add` on a list made with `List.of(...)`?",
        options: [
          "The item is added",
          "It returns false",
          "The list is copied first",
          "It throws `UnsupportedOperationException`",
        ],
        answer: 3,
        explanation: "`List.of` creates unmodifiable lists.",
      },
      {
        question: "What does `counts.merge(word, 1, Integer::sum)` do?",
        options: [
          "Replaces the count with 1",
          "Puts 1 if the word is new, otherwise adds 1 to the existing count",
          "Removes the word",
          "Sorts the map",
        ],
        answer: 1,
        explanation: "A one-line way to count occurrences.",
      },
    ],
  },

  generics: {
    solution: {
      notes: [
        "`Stack<T>` wraps an `ArrayDeque<T>`, so pushes and pops are fast and type-safe. `pop` on an empty stack throws a clear exception. `frequencies` works for any element type because it's a generic method.",
      ],
      code: [
        {
          filename: "GenericStack.java",
          lang: "java",
          source: `
import java.util.*;

public class GenericStack {
    static class Stack<T> {
        private final Deque<T> items = new ArrayDeque<>();

        void push(T item) { items.push(item); }

        T pop() {
            if (items.isEmpty()) throw new NoSuchElementException("pop from an empty stack");
            return items.pop();
        }

        T peek() { return items.peek(); }

        boolean isEmpty() { return items.isEmpty(); }
    }

    static <T> Map<T, Integer> frequencies(List<T> items) {
        Map<T, Integer> counts = new LinkedHashMap<>();
        for (T item : items) counts.merge(item, 1, Integer::sum);
        return counts;
    }

    public static void main(String[] args) {
        Stack<String> pages = new Stack<>();
        pages.push("Home");
        pages.push("Lessons");
        System.out.println(pages.pop() + " then " + pages.peek());   // Lessons then Home
        pages.pop();
        try {
            pages.pop();
        } catch (NoSuchElementException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println(frequencies(List.of("A", "B", "A", "C", "A")));   // {A=3, B=1, C=1}
        System.out.println(frequencies(List.of(3, 1, 3)));                   // {3=2, 1=1}
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `List<String>` prevent?",
        options: [
          "Adding more than 10 items",
          "Sorting the list",
          "Adding anything that isn't a String — checked at compile time",
          "Removing items",
        ],
        answer: 2,
        explanation: "Generics catch type mistakes before the program runs, with no casts needed.",
      },
      {
        question: "What does `<T extends Comparable<T>>` require of T?",
        options: [
          "That T can be compared with other T values",
          "That T is a number",
          "That T is a String",
          "Nothing",
        ],
        answer: 0,
        explanation: "The bound lets the method call `compareTo` on T values.",
      },
      {
        question: "Which parameter accepts a `List<Integer>` and a `List<Double>` for reading numbers?",
        options: ["`List<Number>`", "`List<Object>`", "`List<? super Number>`", "`List<? extends Number>`"],
        answer: 3,
        explanation: "\"Producer extends\": read from `? extends T`.",
      },
      {
        question: "What does PECS stand for?",
        options: [
          "Public Extends, Class Super",
          "Producer `extends`, Consumer `super`",
          "Primitive Extends, Collection Super",
          "It's not a Java term",
        ],
        answer: 1,
        explanation: "Read from `? extends T`; write into `? super T`.",
      },
    ],
  },

  exceptions: {
    solution: {
      notes: [
        "`InvalidLineException` extends `Exception`, so it's checked: `parseLine` must declare it and callers must handle it — the compiler won't let anyone forget. The original `NumberFormatException` is kept as the cause.",
      ],
      code: [
        {
          filename: "ParseLines.java",
          lang: "java",
          source: `
import java.util.ArrayList;
import java.util.List;

public class ParseLines {
    record Result(String name, int score) {}

    static class InvalidLineException extends Exception {
        InvalidLineException(String message, Throwable cause) { super(message, cause); }
        InvalidLineException(String message) { this(message, null); }
    }

    static Result parseLine(String line) throws InvalidLineException {
        int comma = line.indexOf(',');
        if (comma < 0) throw new InvalidLineException("missing comma in '" + line + "'");
        String name = line.substring(0, comma).strip();
        if (name.isEmpty()) throw new InvalidLineException("blank name in '" + line + "'");
        try {
            int score = Integer.parseInt(line.substring(comma + 1).strip());
            if (score < 0 || score > 100) throw new InvalidLineException("score out of range in '" + line + "'");
            return new Result(name, score);
        } catch (NumberFormatException e) {
            throw new InvalidLineException("bad score in '" + line + "'", e);
        }
    }

    public static void main(String[] args) {
        List<Result> valid = new ArrayList<>();
        int failed = 0;
        for (String line : List.of("Amina,88", "Juma 42", " ,70", "Neema,abc", "Ali,150", "Rehema, 71")) {
            try {
                valid.add(parseLine(line));
            } catch (InvalidLineException e) {
                failed++;
                System.out.println("Skipped: " + e.getMessage());
            }
        }
        System.out.println(valid);
        System.out.println("Failed: " + failed);   // Failed: 4
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a checked exception?",
        options: [
          "One the compiler forces you to catch or declare with `throws`",
          "One that is checked at runtime only",
          "Any exception that has been caught",
          "A subclass of `RuntimeException`",
        ],
        answer: 0,
        explanation: "`IOException` is checked; `IllegalArgumentException` is unchecked.",
      },
      {
        question: "What does try-with-resources do?",
        options: [
          "Retries failed code",
          "Catches every exception",
          "Closes the declared resources automatically, even if an exception occurs",
          "Runs code in parallel",
        ],
        answer: 2,
        explanation: "`try (var reader = ...) { }` closes `reader` for you.",
      },
      {
        question: "When does a `finally` block run?",
        options: [
          "Only when an exception was thrown",
          "Always — whether or not an exception occurred",
          "Only when no exception occurred",
          "Never, it's optional syntax",
        ],
        answer: 1,
        explanation: "Use it for cleanup that must always happen.",
      },
      {
        question: "Why pass the original exception as the `cause` when wrapping it?",
        options: [
          "It makes the program faster",
          "It hides the error",
          "It's required by the compiler",
          "The root cause stays visible in the stack trace for debugging",
        ],
        answer: 3,
        explanation: "Losing the cause makes problems much harder to diagnose.",
      },
    ],
  },

  "lambdas-and-streams": {
    solution: {
      notes: [
        "`groupingBy` with `maxBy` finds each subject's top result. Students who passed everything are those whose minimum score is at least 30. The last map groups each student's scores into a list and sorts it in descending order with `collectingAndThen`.",
      ],
      code: [
        {
          filename: "StreamReports.java",
          lang: "java",
          source: `
import java.util.*;
import java.util.stream.Collectors;

public class StreamReports {
    record Result(String student, String subject, int score) {}

    public static void main(String[] args) {
        List<Result> results = List.of(
            new Result("Amina", "Maths", 88), new Result("Amina", "Biology", 79),
            new Result("Juma", "Maths", 29),  new Result("Juma", "Biology", 48),
            new Result("Neema", "Maths", 71), new Result("Neema", "Biology", 84),
            new Result("Ali", "Maths", 95),   new Result("Ali", "Biology", 62));

        Map<String, String> topPerSubject = results.stream()
            .collect(Collectors.groupingBy(Result::subject, TreeMap::new,
                Collectors.collectingAndThen(
                    Collectors.maxBy(Comparator.comparingInt(Result::score)),
                    best -> best.map(Result::student).orElse("-"))));
        System.out.println(topPerSubject);          // {Biology=Neema, Maths=Ali}

        List<String> passedAll = results.stream()
            .collect(Collectors.groupingBy(Result::student, TreeMap::new,
                Collectors.minBy(Comparator.comparingInt(Result::score))))
            .entrySet().stream()
            .filter(e -> e.getValue().map(r -> r.score() >= 30).orElse(false))
            .map(Map.Entry::getKey)
            .toList();
        System.out.println(passedAll);              // [Ali, Amina, Neema]

        Map<String, List<Integer>> scores = results.stream()
            .collect(Collectors.groupingBy(Result::student, TreeMap::new,
                Collectors.mapping(Result::score, Collectors.collectingAndThen(Collectors.toList(), list -> {
                    list.sort(Comparator.reverseOrder());
                    return list;
                }))));
        System.out.println(scores);                 // {Ali=[95, 62], Amina=[88, 79], Juma=[48, 29], Neema=[84, 71]}
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is a functional interface?",
        options: [
          "An interface with exactly one abstract method, which a lambda can implement",
          "Any interface",
          "A class with only static methods",
          "An interface with no methods",
        ],
        answer: 0,
        explanation: "`Predicate<T>`, `Function<T, R>` and `Comparator<T>` are examples.",
      },
      {
        question: "What does the method reference `Student::name` stand for?",
        options: [
          "A static field",
          "A new Student",
          "The lambda `s -> s.name()`",
          "The class name",
        ],
        answer: 2,
        explanation: "Method references are shorthand for lambdas that just call a method.",
      },
      {
        question: "What does `Optional` help you avoid?",
        options: [
          "Loops",
          "Returning `null` for missing values (and the NullPointerExceptions that follow)",
          "Exceptions of every kind",
          "Generics",
        ],
        answer: 1,
        explanation: "Use `orElse`, `map` and `ifPresent` to handle the missing case explicitly.",
      },
      {
        question: "Which collector builds a `Map` of groups, e.g. results per student?",
        options: ["`Collectors.joining`", "`Collectors.counting`", "`Collectors.toList`", "`Collectors.groupingBy`"],
        answer: 3,
        explanation: "`groupingBy(key, downstream)` groups and then summarises each group.",
      },
    ],
  },

  "files-and-io": {
    solution: {
      notes: [
        "`Files.list` finds the CSV files (wrapped in try-with-resources), and each file's lines are read and added to a per-student map of subject → score. The summary line for each student shows the average and the best subject, and `Files.write` saves it.",
      ],
      code: [
        {
          filename: "Summarise.java",
          lang: "java",
          source: `
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.Stream;

public class Summarise {
    public static void main(String[] args) throws IOException {
        Path folder = Files.createDirectories(Path.of("results"));
        Files.writeString(folder.resolve("term1.csv"), "name,subject,score\\nAmina,Maths,88\\nJuma,Maths,42\\n");
        Files.writeString(folder.resolve("term2.csv"), "name,subject,score\\nAmina,Biology,79\\nJuma,Biology,61\\n");

        Map<String, Map<String, Integer>> scores = new TreeMap<>();
        try (Stream<Path> files = Files.list(folder)) {
            for (Path csv : files.filter(p -> p.getFileName().toString().endsWith(".csv")).sorted().toList()) {
                List<String> lines = Files.readAllLines(csv);
                for (String line : lines.subList(1, lines.size())) {     // skip the header
                    String[] p = line.split(",");
                    scores.computeIfAbsent(p[0], k -> new TreeMap<>()).put(p[1], Integer.parseInt(p[2]));
                }
            }
        }

        List<String> summary = new ArrayList<>();
        scores.forEach((student, subjects) -> {
            double avg = subjects.values().stream().mapToInt(Integer::intValue).average().orElse(0);
            String best = Collections.max(subjects.entrySet(), Map.Entry.comparingByValue()).getKey();
            summary.add("%s: average %.1f, best subject %s".formatted(student, avg, best));
        });

        Files.write(Path.of("summary.txt"), summary);
        System.out.print(Files.readString(Path.of("summary.txt")));
        // Amina: average 83.5, best subject Maths
        // Juma: average 51.5, best subject Biology
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Which class represents a file location in modern Java?",
        options: ["`java.io.File` only", "`String`", "`java.nio.file.Path`", "`Scanner`"],
        answer: 2,
        explanation: "`Path` plus the `Files` helper class is the modern file API.",
      },
      {
        question: "Why wrap `Files.lines(path)` in try-with-resources?",
        options: [
          "The returned stream holds the file open until it is closed",
          "It reads faster",
          "It's required to compile",
          "To convert the lines to numbers",
        ],
        answer: 0,
        explanation: "Leaking open files eventually exhausts the operating system's limit.",
      },
      {
        question: "Which method reads a small file into a single String?",
        options: ["`Files.list`", "`Files.walk`", "`Files.size`", "`Files.readString`"],
        answer: 3,
        explanation: "For large files, process lines lazily with `Files.lines` instead.",
      },
      {
        question: "What exception does `Files.readString` throw for a missing file?",
        options: ["`NullPointerException`", "`NoSuchFileException` (an `IOException`)", "`FileMissingError`", "Nothing — it returns an empty String"],
        answer: 1,
        explanation: "Handle it where you can give the user a useful message.",
      },
    ],
  },
};
