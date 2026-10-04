import type { LevelTrack } from "../types";

export const beginner: LevelTrack = {
  intro:
    "Start from zero with Java: install the JDK, run your first program, and learn the fundamentals — types, decisions, loops, methods, arrays, strings and your first classes. All examples run with Java 21 using a single `java File.java` command.",
  outcomes: [
    "Install the JDK and compile and run Java programs",
    "Use primitive types, String, var and type conversion correctly",
    "Write conditions, switch expressions, loops and methods",
    "Work with arrays and strings, and define simple classes",
  ],
  lessons: [
    {
      slug: "setup",
      title: "Setting up Java",
      summary: "Install the JDK, understand the main method, and run your first program.",
      body: [
        "Java is a statically typed, object-oriented language that runs on the Java Virtual Machine (JVM). It powers banking systems, Android apps, large web back-ends and big-data tools. Install a JDK (Java Development Kit) — version 21 LTS or newer — from adoptium.net, then check with `java -version`.",
        "Every Java program starts in a `main` method inside a class. The file name must match the public class name: class `Hello` lives in `Hello.java`.",
        "Since Java 11 you can run a single source file directly with `java Hello.java` — ideal for learning. Larger projects compile with `javac` (or a build tool such as Maven) into `.class` files that the JVM runs. IntelliJ IDEA Community and VS Code with the Java extensions are excellent free editors.",
      ],
      code: [
        {
          filename: "Hello.java",
          lang: "java",
          source: `
import java.time.Year;

public class Hello {
    public static void main(String[] args) {
        String name = "Dolese";
        int year = Year.now().getValue();
        System.out.println("Hello, " + name + "! Welcome to Java in " + year + ".");
    }
}
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
java -version
java Hello.java            # compile and run in one step

javac Hello.java           # or: compile to Hello.class ...
java Hello                 # ... then run the compiled class
`,
        },
      ],
      keyPoints: [
        "Programs start at `public static void main(String[] args)`.",
        "A public class must live in a file with the same name.",
        "`java File.java` runs a single file directly; `javac` compiles for larger projects.",
      ],
      exercise:
        "Write `About.java` that prints your name, school and favourite subject on three lines. Then pass your name as a command-line argument (`java About.java Amina`) and print it using `args[0]`.",
    },
    {
      slug: "variables-and-types",
      title: "Variables, Types & Strings",
      summary: "Primitive types, String, var, casting, integer division and formatting output.",
      body: [
        "Java is statically typed: every variable has a type that never changes. Primitive types hold simple values — `int` and `long` (whole numbers), `double` (decimals), `boolean` and `char`. `String` holds text and is an object. `final` makes a variable unchangeable.",
        "`var` lets the compiler infer the type of a local variable from its value — the type is still fixed, you just don't repeat it.",
        "Watch out: dividing two `int`s gives an `int` (`7 / 2` is `3`). Cast one side to `double` for a decimal result. Convert text to numbers with `Integer.parseInt`, and format output with `String.format` or `formatted`. For money, use `BigDecimal` rather than `double`.",
      ],
      code: [
        {
          filename: "Basics.java",
          lang: "java",
          source: `
import java.math.BigDecimal;

public class Basics {
    public static void main(String[] args) {
        final String school = "Azania Secondary";
        int students = 420;
        students += 15;
        long population = 65_000_000L;
        double average = (78 + 64 + 91) / 3.0;
        boolean isOpen = true;
        char stream = 'A';
        var subject = "Biology";          // inferred as String

        System.out.println(school + " has " + students + " students in stream " + stream);
        System.out.println("Open? " + isOpen + ", population " + population + ", subject " + subject);

        System.out.println(7 / 2);                 // 3   (integer division)
        System.out.println(7 / 2.0);               // 3.5
        System.out.println((double) 7 / 2);        // 3.5 (cast first)
        System.out.println(7 % 2);                 // 1   (remainder)

        int score = Integer.parseInt("88");
        System.out.println(score + 2);             // 90
        System.out.println(String.format("Average: %.1f", average));
        System.out.println("%s scored %d%%".formatted("Amina", score));

        System.out.println(0.1 + 0.2);             // 0.30000000000000004
        System.out.println(new BigDecimal("0.10").add(new BigDecimal("0.20")));   // 0.30

        String name = "  amina juma  ";
        String clean = name.strip().toUpperCase();
        System.out.println(clean + " (" + clean.length() + " characters)");
        System.out.println(clean.equals("AMINA JUMA"));   // compare Strings with equals, not ==
    }
}
`,
        },
      ],
      keyPoints: [
        "Every variable has a fixed type; `var` just infers it.",
        "`int / int` truncates — use a `double` or cast for decimals; use `BigDecimal` for money.",
        "Compare Strings with `.equals()`, never `==`.",
      ],
      exercise:
        "Write a program that stores three scores as Strings (as if typed by a user), converts them with `Integer.parseInt`, and prints the total and the average to two decimal places using `String.format`.",
    },
    {
      slug: "control-flow",
      title: "Decisions, Switch & Loops",
      summary: "if / else, switch expressions, the ternary operator, for, enhanced for, while and do-while.",
      body: [
        "`if`, `else if` and `else` choose what runs; combine conditions with `&&`, `||` and `!`. The ternary `condition ? a : b` picks between two values.",
        "Modern Java has switch expressions: `case \"A\" -> \"Excellent\";` with arrows, no fall-through and a value you can assign. Use `default` to cover everything else.",
        "Loops: the classic `for (int i = 0; i < n; i++)`, the enhanced `for (int s : scores)` for every item, `while` for repeating until a condition changes, and `do...while` when the body must run at least once. `break` exits a loop; `continue` skips to the next round.",
      ],
      code: [
        {
          filename: "Grades.java",
          lang: "java",
          source: `
public class Grades {
    static String gradeFor(int score) {
        if (score >= 75) return "A";
        else if (score >= 65) return "B";
        else if (score >= 45) return "C";
        else if (score >= 30) return "D";
        else return "F";
    }

    static String remarkFor(String grade) {
        return switch (grade) {
            case "A" -> "Excellent";
            case "B" -> "Very good";
            case "C" -> "Good";
            case "D" -> "Satisfactory";
            default -> "Fail";
        };
    }

    public static void main(String[] args) {
        int[] scores = {82, 67, 49, 31, 18};

        for (int score : scores) {
            String grade = gradeFor(score);
            System.out.println(score + " -> " + grade + " (" + remarkFor(grade) + ")");
        }

        for (int i = 0; i < scores.length; i++) {
            String status = scores[i] >= 30 ? "pass" : "fail";
            System.out.println("Student " + (i + 1) + ": " + status);
        }

        for (int n = 1; n <= 15; n++) {
            if (n % 15 == 0) System.out.print("FizzBuzz ");
            else if (n % 3 == 0) System.out.print("Fizz ");
            else if (n % 5 == 0) System.out.print("Buzz ");
            else System.out.print(n + " ");
        }
        System.out.println();

        int countdown = 3;
        while (countdown > 0) {
            System.out.println("Starting in " + countdown + "...");
            countdown--;
        }
    }
}
`,
        },
      ],
      keyPoints: [
        "Prefer switch expressions with `->`: no fall-through, and they return a value.",
        "Enhanced `for` for every item; indexed `for` when you need positions.",
        "Keep conditions simple — return early from methods instead of nesting.",
      ],
      exercise:
        "Print the multiplication table (1–12) for a number given as a command-line argument. Then write a program that keeps doubling an investment of 100,000 TSh at 12% per year with a `while` loop until it exceeds 1,000,000, printing each year.",
    },
    {
      slug: "methods",
      title: "Methods",
      summary: "Define static methods with parameters and return types, overload them, and pass values.",
      body: [
        "A method is a named block of code inside a class. Its signature declares the return type, name and parameter types: `static double percentage(int score, int outOf)`. `void` means it returns nothing.",
        "Overloading lets several methods share a name with different parameter lists — `average(int[] values)` and `average(double[] values)`. Varargs (`int... values`) accept any number of arguments.",
        "Java always passes arguments by value: a method gets a copy of a primitive, so changing it inside has no effect outside. For objects and arrays, the copy is a reference to the same object, so the method can change the object's contents.",
      ],
      code: [
        {
          filename: "Methods.java",
          lang: "java",
          source: `
public class Methods {
    static int percentage(int score, int outOf) {
        return (int) Math.round(score * 100.0 / outOf);
    }

    static int percentage(int score) {           // overload with a default "out of"
        return percentage(score, 100);
    }

    static double average(int... values) {       // varargs
        if (values.length == 0) return 0;
        int total = 0;
        for (int v : values) total += v;
        return (double) total / values.length;
    }

    static String greet(String name, String title) {
        return title == null ? "Hello, " + name : "Hello, " + title + " " + name;
    }

    static void tryToChange(int number, int[] numbers) {
        number = 99;          // changes the local copy only
        numbers[0] = 99;      // changes the shared array
    }

    public static void main(String[] args) {
        System.out.println(percentage(42, 50));           // 84
        System.out.println(percentage(73));               // 73
        System.out.println(average(78, 64, 91));          // 77.66666666666667
        System.out.println(greet("Amina", null));
        System.out.println(greet("Juma", "Mr."));

        int n = 1;
        int[] arr = {1, 2, 3};
        tryToChange(n, arr);
        System.out.println(n + " " + arr[0]);             // 1 99
    }
}
`,
        },
      ],
      keyPoints: [
        "Declare parameter and return types; `void` returns nothing.",
        "Overloading and varargs give flexible, readable method calls.",
        "Arguments are passed by value — object contents can still be changed through a reference.",
      ],
      exercise:
        "Write `areaOfRectangle(double w, double h)`, `areaOfCircle(double r)` and an overloaded `describe(double area)` / `describe(double area, String units)` that returns \"Area: 12.00 cm²\".",
    },
    {
      slug: "arrays-and-strings",
      title: "Arrays & Strings",
      summary: "Create and process arrays, use the Arrays helper class, and build text with StringBuilder.",
      body: [
        "An array holds a fixed number of values of one type: `int[] scores = {78, 64, 91};`. Indexes start at 0, and `scores.length` gives the size. Accessing an index outside the array throws an `ArrayIndexOutOfBoundsException`.",
        "The `java.util.Arrays` class sorts, searches, fills, copies and prints arrays. Two-dimensional arrays (`int[][]`) model tables such as a timetable or a marks sheet.",
        "Strings are immutable — every change creates a new String. Useful methods include `split`, `contains`, `substring`, `replace`, `charAt` and `join`. When building text in a loop, use `StringBuilder` for efficiency.",
      ],
      code: [
        {
          filename: "ArraysDemo.java",
          lang: "java",
          source: `
import java.util.Arrays;

public class ArraysDemo {
    public static void main(String[] args) {
        int[] scores = {78, 64, 91, 45, 88};
        String[] names = {"Neema", "Amina", "Juma", "Baraka", "Rehema"};

        int best = scores[0];
        for (int s : scores) best = Math.max(best, s);
        System.out.println("Best: " + best);

        int[] sorted = Arrays.copyOf(scores, scores.length);
        Arrays.sort(sorted);
        System.out.println(Arrays.toString(sorted));          // [45, 64, 78, 88, 91]
        System.out.println(Arrays.stream(scores).average().orElse(0));

        Arrays.sort(names);
        System.out.println(String.join(", ", names));

        int[][] marks = {
            {88, 79, 91},   // Amina: Maths, Biology, English
            {42, 55, 61},   // Juma
        };
        for (int row = 0; row < marks.length; row++) {
            int total = 0;
            for (int mark : marks[row]) total += mark;
            System.out.println("Row " + row + " total: " + total);
        }

        String line = "Amina Hassan,4,A,88";
        String[] parts = line.split(",");
        System.out.println(parts[0].toUpperCase() + " | form " + parts[1] + " | starts with A? " + parts[0].startsWith("A"));

        StringBuilder report = new StringBuilder();
        for (int i = 0; i < names.length; i++) {
            report.append(i + 1).append(". ").append(names[i]).append('\\n');
        }
        System.out.print(report);
    }
}
`,
        },
      ],
      keyPoints: [
        "Arrays have a fixed size; indexes run from 0 to `length - 1`.",
        "Use `java.util.Arrays` for sorting, copying and printing.",
        "Strings are immutable; build text in loops with `StringBuilder`.",
      ],
      exercise:
        "Store a week of daily temperatures in an array. Print the highest, lowest and average, the days above average, and a simple bar chart using `\"*\".repeat(n)`.",
    },
    {
      slug: "classes-and-objects",
      title: "Classes & Objects",
      summary: "Fields, constructors, methods, encapsulation with private fields, and toString.",
      body: [
        "A class is a blueprint; objects are instances created with `new`. Fields hold each object's data, constructors set it up, and instance methods act on it using `this`.",
        "Encapsulation: make fields `private` and expose behaviour through public methods, so the class can protect its rules (such as \"a score must be 0–100\"). Throw an exception such as `IllegalArgumentException` when a rule is broken.",
        "Override `toString()` to control how an object prints. `static` members belong to the class rather than to each object — like a shared pass mark.",
      ],
      code: [
        {
          filename: "School.java",
          lang: "java",
          source: `
import java.util.ArrayList;
import java.util.List;

public class School {
    public static void main(String[] args) {
        Student amina = new Student("Amina Hassan", 4);
        amina.addScore(88);
        amina.addScore(79);

        Student juma = new Student("Juma Said", 3);
        juma.addScore(25);

        System.out.println(amina);
        System.out.println(juma);
        System.out.println("Pass mark: " + Student.PASS_MARK);

        try {
            juma.addScore(150);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}

class Student {
    static final int PASS_MARK = 30;

    private final String name;
    private final int form;
    private final List<Integer> scores = new ArrayList<>();

    Student(String name, int form) {
        this.name = name;
        this.form = form;
    }

    void addScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("score must be 0-100, got " + score);
        }
        scores.add(score);
    }

    double average() {
        if (scores.isEmpty()) return 0;
        int total = 0;
        for (int s : scores) total += s;
        return (double) total / scores.size();
    }

    boolean passed() {
        return average() >= PASS_MARK;
    }

    String getName() {
        return name;
    }

    @Override
    public String toString() {
        return "%s (Form %d): average %.1f - %s".formatted(name, form, average(), passed() ? "PASS" : "FAIL");
    }
}
`,
        },
      ],
      keyPoints: [
        "Keep fields `private`; enforce rules inside methods.",
        "Constructors set up valid objects; `this` refers to the current object.",
        "Override `toString()` for readable output; `static` members are shared by all objects.",
      ],
      exercise:
        "Create a `BankAccount` class with a private balance, `deposit` and `withdraw` methods that reject invalid amounts, and a `toString`. Create two accounts in `main`, transfer money between them and print both.",
    },
  ],
};
