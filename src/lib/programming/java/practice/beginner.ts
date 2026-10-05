import type { Practice } from "../../types";
import { readingInput as readingInputPractice, datesAndTimes as datesAndTimesPractice } from "./more";

export const beginner: Record<string, Practice> = {
  setup: {
    solution: {
      notes: [
        "Command-line arguments arrive in the `args` array. Checking `args.length` first avoids an `ArrayIndexOutOfBoundsException` when no name is given.",
      ],
      code: [
        {
          filename: "About.java",
          lang: "java",
          source: `
public class About {
    public static void main(String[] args) {
        String name = args.length > 0 ? args[0] : "Amina";
        System.out.println("Name: " + name);
        System.out.println("School: Azania Secondary");
        System.out.println("Favourite subject: Biology");
    }
}
`,
        },
        {
          filename: "Terminal",
          lang: "bash",
          source: `
java About.java Juma
# Name: Juma
# School: Azania Secondary
# Favourite subject: Biology
`,
        },
      ],
    },
    quiz: [
      {
        question: "Where does every Java program start running?",
        options: [
          "The first line of the file",
          "`public static void main(String[] args)`",
          "The constructor",
          "Any method named `start`",
        ],
        answer: 1,
        explanation: "The JVM looks for the `main` method in the class you run.",
      },
      {
        question: "A file contains `public class Report`. What must the file be called?",
        options: ["`report.java`", "`Main.java`", "`Report.java`", "Any name ending in `.java`"],
        answer: 2,
        explanation: "A public class must live in a file with exactly the same name.",
      },
      {
        question: "What does `java Hello.java` do?",
        options: [
          "Compiles and runs a single source file in one step",
          "Only compiles the file",
          "Deletes compiled classes",
          "Opens the file in an editor",
        ],
        answer: 0,
        explanation: "Since Java 11, single-file programs can run directly from source.",
      },
      {
        question: "What does the JDK include that a JRE alone does not?",
        options: ["The JVM", "The standard library", "A web browser", "Development tools such as the `javac` compiler"],
        answer: 3,
        explanation: "To write Java, install a JDK (Java Development Kit).",
      },
    ],
  },

  "variables-and-types": {
    solution: {
      notes: [
        "`Integer.parseInt` turns each text score into an `int`. Dividing by `3.0` (a double) avoids integer division, and `String.format(\"%.2f\", ...)` shows two decimal places.",
      ],
      code: [
        {
          filename: "Scores.java",
          lang: "java",
          source: `
public class Scores {
    public static void main(String[] args) {
        String[] typed = {"78", "64", "91"};

        int total = 0;
        for (String text : typed) {
            total += Integer.parseInt(text);
        }
        double average = total / 3.0;

        System.out.println("Total: " + total);                              // Total: 233
        System.out.println(String.format("Average: %.2f", average));        // Average: 77.67
        System.out.println("Integer division would give: " + total / 3);    // 77
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does `7 / 2` evaluate to in Java?",
        options: ["3.5", "4", "3", "An error"],
        answer: 2,
        explanation: "Dividing two `int`s truncates. Use `7 / 2.0` or a cast for 3.5.",
      },
      {
        question: "How should you compare two Strings for equal text?",
        options: ["`a == b`", "`a.equals(b)`", "`a = b`", "`a.compare(b)`"],
        answer: 1,
        explanation: "`==` compares object references; `.equals` compares the characters.",
      },
      {
        question: "What does `var count = 10;` mean?",
        options: [
          "The compiler infers `count` is an `int`; its type is still fixed",
          "`count` can later hold a String",
          "`count` is a constant",
          "It's JavaScript, not Java",
        ],
        answer: 0,
        explanation: "`var` infers local variable types — Java stays statically typed.",
      },
      {
        question: "Which type should you use for exact money calculations?",
        options: ["`double`", "`float`", "`int` cents divided by 100", "`BigDecimal`"],
        answer: 3,
        explanation: "`double` can't represent many decimals exactly (0.1 + 0.2 = 0.30000000000000004).",
      },
    ],
  },

  "control-flow": {
    solution: {
      notes: [
        "The table loops from 1 to 12, reading the number from the first argument. The investment loop repeats while the balance is still at or below one million, growing it by 12% and counting years.",
      ],
      code: [
        {
          filename: "Loops.java",
          lang: "java",
          source: `
public class Loops {
    public static void main(String[] args) {
        int number = args.length > 0 ? Integer.parseInt(args[0]) : 7;
        for (int i = 1; i <= 12; i++) {
            System.out.printf("%2d x %d = %d%n", i, number, i * number);
        }

        double balance = 100_000;
        int year = 0;
        while (balance <= 1_000_000) {
            balance *= 1.12;
            year++;
            System.out.printf("Year %2d: %,.0f TSh%n", year, balance);
        }
        System.out.println("It takes " + year + " years to pass 1,000,000 TSh.");
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is special about a switch expression with arrows (`case \"A\" -> ...`)?",
        options: [
          "It falls through to the next case",
          "It only works with numbers",
          "It has no fall-through and can produce a value",
          "It needs a `break` in every case",
        ],
        answer: 2,
        explanation: "Arrow cases don't fall through, and the whole switch can be assigned.",
      },
      {
        question: "Which loop suits \"repeat until the balance passes 1,000,000\"?",
        options: ["`while`", "Enhanced `for`", "`switch`", "A fixed `for (int i = 0; i < 10; i++)`"],
        answer: 0,
        explanation: "You don't know the number of rounds in advance, so `while` fits.",
      },
      {
        question: "What does the enhanced `for (int s : scores)` give you?",
        options: ["The index of each item", "Only the first item", "The array's length", "Each item in turn"],
        answer: 3,
        explanation: "Use a classic indexed `for` when you need positions.",
      },
      {
        question: "What does `continue` do inside a loop?",
        options: [
          "Ends the loop",
          "Skips the rest of the current round and starts the next",
          "Restarts the program",
          "Throws an exception",
        ],
        answer: 1,
        explanation: "`break` exits the loop; `continue` moves to the next iteration.",
      },
    ],
  },

  methods: {
    solution: {
      notes: [
        "Two `describe` methods share a name but take different parameters (overloading). The one-argument version calls the two-argument version with \"cm\", so the formatting lives in one place.",
      ],
      code: [
        {
          filename: "Areas.java",
          lang: "java",
          source: `
public class Areas {
    static double areaOfRectangle(double width, double height) {
        return width * height;
    }

    static double areaOfCircle(double radius) {
        return Math.PI * radius * radius;
    }

    static String describe(double area, String units) {
        return String.format("Area: %.2f sq %s", area, units);
    }

    static String describe(double area) {
        return describe(area, "cm");
    }

    public static void main(String[] args) {
        System.out.println(describe(areaOfRectangle(3, 4)));        // Area: 12.00 sq cm
        System.out.println(describe(areaOfCircle(2), "m"));         // Area: 12.57 sq m
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What does the return type `void` mean?",
        options: ["The method returns null", "The method returns nothing", "The method is empty", "The method is private"],
        answer: 1,
        explanation: "A `void` method performs an action without producing a value.",
      },
      {
        question: "What is method overloading?",
        options: [
          "Calling a method too many times",
          "A method that calls itself",
          "Several methods with the same name but different parameter lists",
          "Replacing a parent class method",
        ],
        answer: 2,
        explanation: "The compiler picks the version that matches the arguments.",
      },
      {
        question: "A method sets its `int` parameter to 99. What happens to the caller's variable?",
        options: [
          "Nothing — the method received a copy of the value",
          "It becomes 99",
          "It becomes 0",
          "A compile error",
        ],
        answer: 0,
        explanation: "Java passes arguments by value.",
      },
      {
        question: "What does `static double average(int... values)` accept?",
        options: ["Exactly one int", "Only an array of doubles", "No arguments", "Any number of int arguments"],
        answer: 3,
        explanation: "Varargs (`...`) collect the arguments into an array.",
      },
    ],
  },

  "arrays-and-strings": {
    solution: {
      notes: [
        "One pass finds the highest, lowest and total. A second pass, which needs the average, prints the days above it. `\"*\".repeat(n)` draws each bar, scaled down so it fits on screen.",
      ],
      code: [
        {
          filename: "Temperatures.java",
          lang: "java",
          source: `
public class Temperatures {
    public static void main(String[] args) {
        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        int[] temps = {28, 31, 30, 33, 29, 27, 32};

        int highest = temps[0], lowest = temps[0], total = 0;
        for (int t : temps) {
            highest = Math.max(highest, t);
            lowest = Math.min(lowest, t);
            total += t;
        }
        double average = (double) total / temps.length;
        System.out.printf("Highest %d, lowest %d, average %.1f%n", highest, lowest, average);

        StringBuilder above = new StringBuilder();
        for (int i = 0; i < temps.length; i++) {
            if (temps[i] > average) above.append(days[i]).append(' ');
        }
        System.out.println("Above average: " + above.toString().strip());

        for (int i = 0; i < temps.length; i++) {
            System.out.printf("%s %s %d%n", days[i], "*".repeat(temps[i] - 20), temps[i]);
        }
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "What is the last valid index of an array with 5 elements?",
        options: ["5", "4", "1", "6"],
        answer: 1,
        explanation: "Indexes run from 0 to length − 1.",
      },
      {
        question: "Which class sorts and prints arrays for you?",
        options: ["`java.util.Arrays`", "`java.lang.Math`", "`java.util.Scanner`", "`String`"],
        answer: 0,
        explanation: "`Arrays.sort`, `Arrays.toString`, `Arrays.copyOf` and more.",
      },
      {
        question: "Why use a `StringBuilder` when building text in a loop?",
        options: [
          "Strings can't be joined in Java",
          "It is required for printing",
          "It sorts the text",
          "Strings are immutable, so each `+` would create a new String; StringBuilder appends efficiently",
        ],
        answer: 3,
        explanation: "StringBuilder modifies one buffer instead of creating many temporary strings.",
      },
      {
        question: "What does `\"Amina,4,88\".split(\",\")` return?",
        options: [
          "One string",
          "A list",
          "The array `[\"Amina\", \"4\", \"88\"]`",
          "The number 3",
        ],
        answer: 2,
        explanation: "`split` breaks a String around the separator into a `String[]`.",
      },
    ],
  },

  "classes-and-objects": {
    solution: {
      notes: [
        "The balance is `private`, so it can only change through `deposit` and `withdraw`, which reject invalid amounts. A transfer is simply a withdrawal from one account followed by a deposit to the other.",
      ],
      code: [
        {
          filename: "Bank.java",
          lang: "java",
          source: `
public class Bank {
    public static void main(String[] args) {
        BankAccount amina = new BankAccount("Amina");
        BankAccount juma = new BankAccount("Juma");

        amina.deposit(100_000);
        amina.withdraw(30_000);
        juma.deposit(amina.withdraw(25_000));   // transfer 25,000 from Amina to Juma

        System.out.println(amina);   // Amina: 45000 TSh
        System.out.println(juma);    // Juma: 25000 TSh

        try {
            juma.withdraw(50_000);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }
    }
}

class BankAccount {
    private final String owner;
    private long balance;

    BankAccount(String owner) {
        this.owner = owner;
    }

    void deposit(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("deposit must be positive");
        balance += amount;
    }

    long withdraw(long amount) {
        if (amount <= 0) throw new IllegalArgumentException("withdrawal must be positive");
        if (amount > balance) throw new IllegalArgumentException(owner + " has only " + balance + " TSh");
        balance -= amount;
        return amount;
    }

    @Override
    public String toString() {
        return owner + ": " + balance + " TSh";
    }
}
`,
        },
      ],
    },
    quiz: [
      {
        question: "Why make a class's fields `private`?",
        options: [
          "To make the program faster",
          "So the class controls how its data changes and can enforce its rules",
          "Private fields use less memory",
          "It's required for constructors",
        ],
        answer: 1,
        explanation: "That's encapsulation: outside code goes through methods that validate changes.",
      },
      {
        question: "What does the keyword `this` refer to inside an instance method?",
        options: ["The class", "The parent class", "The current object", "The main method"],
        answer: 2,
        explanation: "`this.name = name` assigns the parameter to the object's field.",
      },
      {
        question: "What does a `static` field such as `PASS_MARK` belong to?",
        options: ["The class itself, shared by all objects", "Each object separately", "Only the first object", "The main method"],
        answer: 0,
        explanation: "Static members exist once per class.",
      },
      {
        question: "What happens if you don't override `toString()` and print an object?",
        options: [
          "A compile error",
          "Nothing is printed",
          "All fields are printed",
          "Something like `BankAccount@1b6d3586` (class name and hash code)",
        ],
        answer: 3,
        explanation: "Override `toString` for readable output.",
      },
    ],
  },
  "reading-input": readingInputPractice,
  "dates-and-times": datesAndTimesPractice,
};
