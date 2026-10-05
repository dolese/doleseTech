import type { Practice } from "../../types";

const JPA = "src/main/java/tz/dolese/results";
const JPA_TEST = "src/test/java/tz/dolese/results";

export const readingInput: Practice = {
  solution: {
    notes: [
      "`askLine` returns `null` when the input ends, and `askInt` loops until it gets a whole number in range, so `main` only has to handle valid values. Each menu choice is one `case` of an arrow switch; `break` inside a case block leaves the switch early (for example, when the name is too short). The statistics are a single loop over the scores.",
    ],
    code: [
      {
        filename: "Menu.java",
        lang: "java",
        source: `
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;

public class Menu {
    static final Scanner IN = new Scanner(System.in);

    // Returns null when the input has ended (Ctrl+D, or the end of a piped file).
    static String askLine(String prompt) {
        System.out.print(prompt);
        if (!IN.hasNextLine()) return null;
        return IN.nextLine().trim();
    }

    static Integer askInt(String prompt, int min, int max) {
        while (true) {
            String text = askLine(prompt);
            if (text == null) return null;
            try {
                int value = Integer.parseInt(text);
                if (value >= min && value <= max) return value;
            } catch (NumberFormatException ignored) {
                // not a number: fall through to the message
            }
            System.out.printf("  Please enter a number from %d to %d.%n", min, max);
        }
    }

    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        List<Integer> scores = new ArrayList<>();

        while (true) {
            System.out.println();
            System.out.println("1) Add student  2) List  3) Statistics  4) Quit");
            Integer choice = askInt("Choose: ", 1, 4);
            if (choice == null || choice == 4) break;

            switch (choice) {
                case 1 -> {
                    String name = askLine("  Name: ");
                    if (name == null || name.length() < 2) {
                        System.out.println("  Name must have at least 2 letters.");
                        break;
                    }
                    Integer score = askInt("  Score: ", 0, 100);
                    if (score == null) break;
                    names.add(name);
                    scores.add(score);
                    System.out.println("  Added " + name + ".");
                }
                case 2 -> {
                    for (int i = 0; i < names.size(); i++) {
                        System.out.printf("  %-15s %3d%n", names.get(i), scores.get(i));
                    }
                }
                case 3 -> {
                    if (scores.isEmpty()) {
                        System.out.println("  No students yet.");
                        break;
                    }
                    int highest = scores.get(0);
                    int lowest = scores.get(0);
                    int total = 0;
                    for (int score : scores) {
                        highest = Math.max(highest, score);
                        lowest = Math.min(lowest, score);
                        total += score;
                    }
                    System.out.printf("  %d students, average %.1f, highest %d, lowest %d%n",
                            scores.size(), (double) total / scores.size(), highest, lowest);
                }
                default -> System.out.println("  Unknown choice.");
            }
        }
        System.out.println("Goodbye!");
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "What happens with `Integer.parseInt(\"4x\")`?",
      options: ["It returns 4", "It returns 0", "It throws NumberFormatException", "It returns null"],
      answer: 2,
      explanation: "Catch the exception and ask the user again.",
    },
    {
      question: "Why read whole lines with `nextLine()` and convert them yourself?",
      options: [
        "nextInt() is deprecated",
        "Mixing nextInt() and nextLine() leaves the line ending behind, so a later nextLine() returns an empty string",
        "nextLine() is faster",
        "Scanner can't read numbers",
      ],
      answer: 1,
      explanation: "Line-by-line reading makes each answer exactly one line.",
    },
    {
      question: "What does `in.hasNextLine()` return when the piped input file has ended?",
      options: ["false", "true", "It waits forever", "It throws an exception"],
      answer: 0,
      explanation: "Checking it lets the program finish cleanly instead of crashing.",
    },
    {
      question: "Which printf format prints 84.666... as `84.7`?",
      options: ["`%d`", "`%s`", "`%,d`", "`%.1f`"],
      answer: 3,
      explanation: "`%.1f` rounds to one decimal place.",
    },
  ],
};

export const datesAndTimes: Practice = {
  solution: {
    notes: [
      "Each due date is computed from the original date with `plusMonths(i)`. Adding one month at a time would drift: 31 Jan → 28 Feb → 28 Mar. `nextSchoolDay` uses an arrow switch on the `DayOfWeek` enum to push weekend dates to Monday. Money stays in a `long` of whole shillings, and the last instalment absorbs the remainder so the total is exact; `%,d` adds the thousands separators.",
    ],
    code: [
      {
        filename: "FeePlan.java",
        lang: "java",
        source: `
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public class FeePlan {
    // Due dates that fall on a weekend move to the following Monday.
    static LocalDate nextSchoolDay(LocalDate date) {
        return switch (date.getDayOfWeek()) {
            case SATURDAY -> date.plusDays(2);
            case SUNDAY -> date.plusDays(1);
            default -> date;
        };
    }

    // Amounts are whole shillings in a long; the last instalment takes the remainder.
    static void printPlan(long total, int count, LocalDate firstDue) {
        var fmt = DateTimeFormatter.ofPattern("EEE d MMM yyyy", Locale.UK);
        long base = total / count;
        long sum = 0;
        for (int i = 0; i < count; i++) {
            long amount = i == count - 1 ? total - base * (count - 1) : base;
            // Always add months to the ORIGINAL date, so 31 Jan -> 28 Feb -> 31 Mar (not 28 Mar)
            LocalDate due = nextSchoolDay(firstDue.plusMonths(i));
            System.out.printf("%-16s TSh %,9d%n", due.format(fmt), amount);
            sum += amount;
        }
        System.out.printf("%-16s TSh %,9d%n", "Total", sum);
    }

    public static void main(String[] args) {
        printPlan(250_000, 3, LocalDate.of(2026, 1, 31));
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "What is `LocalDate.of(2026, 1, 31).plusMonths(1)`?",
      options: ["2026-03-03", "2026-02-28", "2026-02-31", "It throws an exception"],
      answer: 1,
      explanation: "Month arithmetic clamps to the last valid day of the month.",
    },
    {
      question: "Which class should you use to store when a payment happened, for logs and databases?",
      options: ["`LocalDate`", "`LocalTime`", "`String`", "`Instant`"],
      answer: 3,
      explanation: "An Instant is an exact moment in UTC; convert it to a zone only for display.",
    },
    {
      question: "How do you compute someone's age in whole years?",
      options: [
        "`Period.between(born, today).getYears()`",
        "`today.getYear() - born.getYear()`",
        "`ChronoUnit.DAYS.between(born, today) / 365`",
        "`Duration.between(born, today)`",
      ],
      answer: 0,
      explanation: "Period accounts for whether the birthday has happened yet this year.",
    },
    {
      question: "What does `LocalDate.parse(\"2026-02-31\")` do?",
      options: ["Returns 3 March", "Returns 28 February", "Throws DateTimeParseException", "Returns null"],
      answer: 2,
      explanation: "java.time parsing is strict about real calendar dates.",
    },
  ],
};

export const equalityAndOrdering: Practice = {
  solution: {
    notes: [
      "`Exam` bases both `equals` and `hashCode` on subject and term, so a new but equal `Exam` finds the same map entry. The ranking sorts a copy of the list with one `Comparator` and only advances the position when the score changes, giving 1, 2, 2, 4. The last part shows why hash codes must not depend on fields that change: after the change, the set looks in the wrong bucket.",
    ],
    code: [
      {
        filename: "Ranking.java",
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

public class Ranking {
    // Identity is subject + term. A record would generate these methods for you;
    // here they are written out to show what equals and hashCode must agree on.
    static final class Exam {
        private final String subject;
        private final String term;

        Exam(String subject, String term) {
            this.subject = subject;
            this.term = term;
        }

        @Override
        public boolean equals(Object o) {
            return o instanceof Exam e && subject.equals(e.subject) && term.equals(e.term);
        }

        @Override
        public int hashCode() {
            return Objects.hash(subject, term);
        }

        @Override
        public String toString() {
            return subject + " " + term;
        }
    }

    record Entry(String name, int score) {}

    // Score high to low; equal scores alphabetically, so the order is always the same.
    static final Comparator<Entry> BY_SCORE = Comparator.comparingInt(Entry::score).reversed()
            .thenComparing(Entry::name);

    // Positions like "1, 2, 2, 4": a tie shares a position and the next one is skipped.
    static List<String> rank(List<Entry> entries) {
        List<Entry> sorted = new ArrayList<>(entries);
        sorted.sort(BY_SCORE);
        List<String> lines = new ArrayList<>();
        int position = 0;
        for (int i = 0; i < sorted.size(); i++) {
            if (i == 0 || sorted.get(i).score() != sorted.get(i - 1).score()) position = i + 1;
            lines.add(position + ". " + sorted.get(i).name() + " " + sorted.get(i).score());
        }
        return lines;
    }

    // A key whose hashCode changes after it is stored gets lost in a HashSet.
    static final class MutableKey {
        String name;
        MutableKey(String name) { this.name = name; }
        @Override public boolean equals(Object o) { return o instanceof MutableKey k && name.equals(k.name); }
        @Override public int hashCode() { return name.hashCode(); }
    }

    public static void main(String[] args) {
        Map<Exam, List<Entry>> results = new HashMap<>();
        results.computeIfAbsent(new Exam("Maths", "2026-T1"), k -> new ArrayList<>()).add(new Entry("Amina Hassan", 88));
        // A different but equal Exam object finds the same list:
        results.computeIfAbsent(new Exam("Maths", "2026-T1"), k -> new ArrayList<>()).addAll(List.of(
                new Entry("Ali Mohamed", 71), new Entry("Neema Kimaro", 71), new Entry("Juma Said", 29)));
        System.out.println(results.size() + " exam: " + results.keySet());
        rank(results.get(new Exam("Maths", "2026-T1"))).forEach(System.out::println);

        Set<MutableKey> set = new HashSet<>();
        MutableKey key = new MutableKey("Juma");
        set.add(key);
        key.name = "Juma Said";                       // changes the hash code
        System.out.println("contains after change: " + set.contains(key));   // false: lost in the wrong bucket
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "You override `equals` but not `hashCode`. What breaks?",
      options: [
        "Nothing",
        "Sorting",
        "Equal objects may land in different buckets, so HashSet/HashMap treat them as different",
        "toString",
      ],
      answer: 2,
      explanation: "Equal objects must have equal hash codes.",
    },
    {
      question: "`new String(\"Maths\") == \"Maths\"` is...",
      options: [
        "false: they are different objects; use equals",
        "true",
        "a compile error",
        "true only on Java 21",
      ],
      answer: 0,
      explanation: "`==` compares references for objects.",
    },
    {
      question: "Which gives a class its natural order for TreeSet?",
      options: ["Overriding equals", "Implementing Comparable and compareTo", "Implementing Iterable", "Overriding hashCode"],
      answer: 1,
      explanation: "Other orders can be supplied with a Comparator.",
    },
    {
      question: "What do records give you automatically?",
      options: [
        "A no-argument constructor",
        "Setters",
        "Comparable",
        "equals, hashCode and toString based on their components",
      ],
      answer: 3,
      explanation: "Records are ideal value types for map keys and set elements.",
    },
  ],
};

export const regexAndText: Practice = {
  solution: {
    notes: [
      "`LINE` reads the three parts with named groups and tolerates extra spaces; `ADMISSION` is checked separately so the error message can say exactly what is wrong. `parse` throws `IllegalArgumentException` with a message, and the loop collects the problems in a `StringBuilder`. A text block holds the sample input, and `lines()` splits it.",
    ],
    code: [
      {
        filename: "Roster.java",
        lang: "java",
        source: `
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Roster {
    record Line(String admission, int year, String name, int score) {}

    private static final Pattern LINE = Pattern.compile(
            "\\\\s*(?<adm>\\\\S+)\\\\s*:\\\\s*(?<name>[A-Za-z' ]+?)\\\\s*:\\\\s*(?<score>\\\\d{1,3})\\\\s*");
    private static final Pattern ADMISSION = Pattern.compile("ADM-(\\\\d{4})-(\\\\d{4})");
    private static final Pattern DMY = Pattern.compile("\\\\b(\\\\d{2})/(\\\\d{2})/(\\\\d{4})\\\\b");

    // Returns the parsed line, or throws with a message saying exactly what is wrong.
    static Line parse(String text) {
        Matcher m = LINE.matcher(text);
        if (!m.matches()) throw new IllegalArgumentException("cannot read \\"" + text.strip() + "\\"");
        Matcher adm = ADMISSION.matcher(m.group("adm"));
        if (!adm.matches()) throw new IllegalArgumentException("bad admission number " + m.group("adm"));
        int score = Integer.parseInt(m.group("score"));
        if (score > 100) throw new IllegalArgumentException("score " + score + " is above 100");
        String name = m.group("name").replaceAll("\\\\s+", " ");
        return new Line(m.group("adm"), Integer.parseInt(adm.group(1)), name, score);
    }

    public static void main(String[] args) {
        String input = """
                ADM-2026-0001 : Amina  Hassan : 88
                ADM-2026-0002: Juma Said:42
                ADM-26-0003 : Neema Kimaro : 71
                ADM-2025-0104 : Ali Mohamed : 105
                just some text
                """;

        List<Line> ok = new ArrayList<>();
        StringBuilder problems = new StringBuilder();
        for (String text : input.lines().toList()) {
            try {
                ok.add(parse(text));
            } catch (IllegalArgumentException e) {
                problems.append("  skip: ").append(e.getMessage()).append('\\n');
            }
        }
        ok.forEach(l -> System.out.printf("%s (%d) %-14s %3d%n", l.admission(), l.year(), l.name(), l.score()));
        System.out.print(problems);

        String notice = "Exams run from 02/11/2026 to 20/11/2026; results on 15/12/2026.";
        System.out.println(DMY.matcher(notice).replaceAll("$3-$2-$1"));
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "What is the difference between `matcher.matches()` and `matcher.find()`?",
      options: [
        "They are the same",
        "`matches()` needs the whole input to match; `find()` looks for the next match anywhere",
        "`find()` is only for numbers",
        "`matches()` returns the match text",
      ],
      answer: 1,
      explanation: "Use matches() to validate and find() in a loop to extract.",
    },
    {
      question: "How do you write the regex `\\d+` as a Java string literal?",
      options: ["`\"\\d+\"`", "`'\\d+'`", "`\"/\\d+/\"`", "`\"\\\\d+\"`"],
      answer: 3,
      explanation: "Each regex backslash must be doubled inside a Java string.",
    },
    {
      question: "Why use `StringBuilder` when building text in a loop?",
      options: [
        "`+` creates a new string copy every time; StringBuilder appends in place",
        "Strings can't be longer than 255 characters",
        "StringBuilder is thread-safe",
        "It formats numbers",
      ],
      answer: 0,
      explanation: "Repeated `+` in a loop gets slower and slower as the text grows.",
    },
    {
      question: "Why store a `Pattern` in a `static final` field?",
      options: [
        "Patterns can't be local variables",
        "It is required for named groups",
        "Compiling is relatively costly and Pattern is immutable and thread-safe, so compile once and reuse",
        "To make it public",
      ],
      answer: 2,
      explanation: "A Matcher is created per input; the Pattern is shared.",
    },
  ],
};

export const springDataJpa: Practice = {
  solution: {
    notes: [
      "The new column arrives through a new migration, never by editing V1, and the CHECK constraint means the database rejects a bad phone even if a bug skips validation in Java. `Page<Student> findByForm(int, Pageable)` makes Spring add LIMIT/OFFSET and a count query. `@Modifying` runs a single UPDATE for the whole form; `clearAutomatically` discards cached entities so later reads see the new forms.",
    ],
    code: [
      {
        filename: "src/main/resources/db/migration/V2__add_guardian_phone.sql",
        lang: "sql",
        source: `
-- Never edit a migration that has already run: add a new one.
ALTER TABLE students ADD COLUMN guardian_phone text;
ALTER TABLE students ADD CONSTRAINT guardian_phone_format CHECK (guardian_phone ~ '^0[67][0-9]{8}$');
`,
      },
      {
        filename: "Student.java (addition)",
        lang: "java",
        source: `
// In Student.java: a nullable column added by V2
@Column(name = "guardian_phone")
private String guardianPhone;

public String getGuardianPhone() { return guardianPhone; }
public void setGuardianPhone(String guardianPhone) { this.guardianPhone = guardianPhone; }
`,
      },
      {
        filename: `${JPA}/StudentRepository.java`,
        lang: "java",
        source: `
package tz.dolese.results;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByForm(int form, Sort sort);

    // Paging: Spring adds LIMIT/OFFSET and runs a count query for the total.
    Page<Student> findByForm(int form, Pageable pageable);

    Optional<Student> findByAdmissionNumber(String admissionNumber);

    List<Student> findByNameContainingIgnoreCase(String text);

    List<Student> findByGuardianPhoneIsNull();

    @EntityGraph(attributePaths = "results")
    List<Student> findWithResultsByForm(int form);

    @Query("""
            select new tz.dolese.results.StudentAverage(s.name, avg(r.score))
            from Student s join s.results r
            where s.form = :form and r.term = :term
            group by s.id, s.name
            order by avg(r.score) desc
            """)
    List<StudentAverage> averages(int form, String term);

    // One UPDATE statement for many rows, instead of loading and saving each entity.
    // clearAutomatically: forget cached entities, which would otherwise show the old form.
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Student s set s.form = s.form + 1 where s.form = :form")
    int promote(int form);
}
`,
      },
      {
        filename: `${JPA_TEST}/PagingAndPromotionTest.java`,
        lang: "java",
        source: `
package tz.dolese.results;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class PagingAndPromotionTest {
    @Autowired StudentRepository students;

    @BeforeEach
    void seed() {
        for (int i = 1; i <= 5; i++) {
            Student s = new Student("ADM-2026-000" + i, "Student " + i, 4);
            if (i % 2 == 0) s.setGuardianPhone("071234567" + i);
            students.save(s);
        }
        students.save(new Student("ADM-2026-0100", "Neema Kimaro", 3));
    }

    @Test
    void pagesThroughAForm() {
        Page<Student> page = students.findByForm(4, PageRequest.of(1, 2, Sort.by("name")));
        assertThat(page.getTotalElements()).isEqualTo(5);
        assertThat(page.getTotalPages()).isEqualTo(3);
        assertThat(page.getContent()).extracting(Student::getName).containsExactly("Student 3", "Student 4");
    }

    @Test
    void findsMissingGuardianPhones() {
        assertThat(students.findByGuardianPhoneIsNull()).hasSize(4);   // students 1, 3, 5 and Neema
    }

    @Test
    void promotesAWholeFormInOneStatement() {
        assertThat(students.promote(4)).isEqualTo(5);
        assertThat(students.findByForm(5, Sort.unsorted())).hasSize(5);
        assertThat(students.findByAdmissionNumber("ADM-2026-0001").orElseThrow().getForm()).isEqualTo(5);
    }

    @Test
    void databaseRejectsABadPhone() {
        Student s = students.findByAdmissionNumber("ADM-2026-0100").orElseThrow();
        s.setGuardianPhone("12345");
        assertThatThrownBy(students::flush).isInstanceOf(DataIntegrityViolationException.class);
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "A migration V1 has already run in production and you need a new column. What do you do?",
      options: ["Edit V1", "Set ddl-auto=update", "Add a new migration, V2", "Drop and recreate the database"],
      answer: 2,
      explanation: "Applied migrations are history; Flyway also detects edits through checksums.",
    },
    {
      question: "What does Spring generate for `List<Student> findByForm(int form)`?",
      options: [
        "A query selecting students WHERE form = ?",
        "Nothing; you must implement it",
        "A full table scan in Java",
        "A stored procedure",
      ],
      answer: 0,
      explanation: "Derived queries are built from the method name.",
    },
    {
      question: "Loading 30 students and then each one's results lazily runs how many queries?",
      options: ["1", "2", "30", "31: the N+1 problem; fix it with @EntityGraph or join fetch"],
      answer: 3,
      explanation: "One query for the list plus one per student.",
    },
    {
      question: "Inside a `@Transactional` method you call `result.setScore(35)` on a loaded entity. What happens?",
      options: [
        "Nothing until you call save()",
        "The change is written at commit automatically (dirty checking)",
        "An exception is thrown",
        "A new row is inserted",
      ],
      answer: 1,
      explanation: "Managed entities are tracked and flushed when the transaction commits.",
    },
  ],
};

export const projectResultsPortal: Practice = {
  solution: {
    notes: [
      "`TermReport.of` is a pure static method that builds the report from the student and the ranking rows, so it is easy to test, and `grade` is checked at every boundary. The service applies the same `canView` rule as the results endpoint before building anything, so parents get 404 for other children. The ranking is the same native `rank()` query the teachers' endpoint uses, so positions always agree.",
    ],
    code: [
      {
        filename: `${JPA}/TermReport.java`,
        lang: "java",
        source: `
package tz.dolese.results;

import java.util.List;

record SubjectLine(String subject, int score, String grade) {}

record TermReport(String name, String term, List<SubjectLine> subjects, Double average, String position) {

    static String grade(int score) {
        if (score >= 75) return "A";
        if (score >= 65) return "B";
        if (score >= 45) return "C";
        if (score >= 30) return "D";
        return "F";
    }

    // Pure: builds the report from data already loaded, so it is easy to unit-test.
    static TermReport of(Student student, String term, List<RankingRow> ranking) {
        List<SubjectLine> subjects = student.getResults().stream()
                .filter(r -> r.getTerm().equals(term))
                .map(r -> new SubjectLine(r.getSubject(), r.getScore(), grade(r.getScore())))
                .sorted((a, b) -> a.subject().compareTo(b.subject()))
                .toList();
        return ranking.stream()
                .filter(row -> row.getAdmissionNumber().equals(student.getAdmissionNumber()))
                .findFirst()
                .map(row -> new TermReport(student.getName(), term, subjects, row.getAverage(),
                        row.getPosition() + " of " + ranking.size()))
                .orElse(new TermReport(student.getName(), term, subjects, null, null));
    }
}
`,
      },
      {
        filename: "ResultService.java and ResultsController.java (additions)",
        lang: "java",
        source: `
// In ResultService:
    @Transactional(readOnly = true)
    public TermReport report(long studentId, String term, Authentication user) {
        Student student = students.findById(studentId).filter(s -> canView(user, s))
                .orElseThrow(() -> new NoSuchElementException("Student not found"));
        return TermReport.of(student, term, students.ranking(student.getForm(), term));
    }

// In ResultsController:
    @GetMapping("/students/{id}/report")
    TermReport report(@PathVariable long id, @RequestParam String term, Authentication user) {
        return service.report(id, term, user);
    }
`,
      },
      {
        filename: `${JPA_TEST}/TermReportTest.java`,
        lang: "java",
        source: `
package tz.dolese.results;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TermReportTest {
    @Autowired MockMvc mvc;
    @Autowired AppUserRepository users;
    @Autowired StudentRepository students;
    @Autowired PasswordEncoder encoder;

    @Test
    void gradesFollowTheSchoolScale() {
        assertThat(java.util.stream.IntStream.of(75, 74, 65, 64, 45, 44, 30, 29).mapToObj(TermReport::grade))
                .containsExactly("A", "B", "B", "C", "C", "D", "D", "F");
    }

    @Test
    void parentGetsTheirChildsReportWithPosition() throws Exception {
        users.save(new AppUser("mama.amina", encoder.encode("familia"), "PARENT"));
        Student amina = new Student("ADM-2026-0001", "Amina Hassan", 4, "mama.amina");
        amina.addResult("Maths", "2026-T1", 88);
        amina.addResult("Biology", "2026-T1", 60);
        amina.addResult("Maths", "2025-T3", 40);                 // another term: not in the report
        Student ali = new Student("ADM-2026-0003", "Ali Mohamed", 4, null);
        ali.addResult("Maths", "2026-T1", 95);
        Long aminaId = students.save(amina).getId();
        Long aliId = students.save(ali).getId();

        mvc.perform(get("/api/students/" + aminaId + "/report?term=2026-T1").with(httpBasic("mama.amina", "familia")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.subjects.length()").value(2))
                .andExpect(jsonPath("$.subjects[0].grade").value("C"))
                .andExpect(jsonPath("$.subjects[1].grade").value("A"))
                .andExpect(jsonPath("$.average").value(74.0))
                .andExpect(jsonPath("$.position").value("2 of 2"));
        mvc.perform(get("/api/students/" + aliId + "/report?term=2026-T1").with(httpBasic("mama.amina", "familia")))
                .andExpect(status().isNotFound());
    }
}
`,
      },
    ],
  },
  quiz: [
    {
      question: "Why is CSRF protection disabled in this API?",
      options: [
        "CSRF is obsolete",
        "It is stateless with HTTP Basic and no session cookies, so there is no cookie a forged request could ride on",
        "It makes tests faster",
        "Spring Boot 4 removed it",
      ],
      answer: 1,
      explanation: "Keep CSRF on for browser apps that use session cookies.",
    },
    {
      question: "A parent requests another family's student. Why answer 404 instead of 403?",
      options: [
        "404 is faster",
        "Spring requires it",
        "So outsiders can't discover which student ids exist",
        "403 is only for teachers",
      ],
      answer: 2,
      explanation: "Hiding existence is a common choice for object-level access checks.",
    },
    {
      question: "What does a stored password look like with the delegating PasswordEncoder?",
      options: [
        "`{bcrypt}$2a$10$...`: the algorithm id followed by a salted hash",
        "The plain password",
        "Base64 of the password",
        "A SHA-1 hex string",
      ],
      answer: 0,
      explanation: "The prefix lets you move to a stronger algorithm later without breaking old hashes.",
    },
    {
      question: "Why do the tests use `results_portal_test` instead of the development database?",
      options: [
        "Flyway can't migrate development databases",
        "Tests run faster on a database with \"test\" in its name",
        "Spring requires a separate database",
        "Tests must not depend on, or damage, data someone is using, such as the demo seed",
      ],
      answer: 3,
      explanation: "Demo data in the dev database would make the counts and unique keys in the tests fail.",
    },
  ],
};
