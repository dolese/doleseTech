"""Save a class list's marks into the results database from Chapter 4."""
import sys

import psycopg

from report import read_class

EXAM_NAME = "Mock examination"
EXAM_YEAR = 2026


def save(conn, subjects, students):
    """Add the exam, subjects, students and marks. Returns the exam's id."""
    with conn.cursor() as cur:
        cur.execute(
            """INSERT INTO exams (name, year) VALUES (%s, %s)
               ON CONFLICT (name, year) DO UPDATE SET name = EXCLUDED.name
               RETURNING id""",
            (EXAM_NAME, EXAM_YEAR),
        )
        exam_id = cur.fetchone()[0]

        subject_ids = {}
        for subject in subjects:
            cur.execute(
                """INSERT INTO subjects (name) VALUES (%s)
                   ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                   RETURNING id""",
                (subject,),
            )
            subject_ids[subject] = cur.fetchone()[0]

        for student in students:
            cur.execute(
                """INSERT INTO students (admission_no, name, sex) VALUES (%s, %s, %s)
                   ON CONFLICT (admission_no) DO UPDATE SET name = EXCLUDED.name, sex = EXCLUDED.sex
                   RETURNING id""",
                (student["admission_no"], student["name"], student["sex"]),
            )
            student_id = cur.fetchone()[0]
            for subject, mark in student["marks"].items():
                cur.execute(
                    """INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES (%s, %s, %s, %s)
                       ON CONFLICT (exam_id, student_id, subject_id) DO UPDATE SET mark = EXCLUDED.mark""",
                    (exam_id, student_id, subject_ids[subject], mark),
                )
    return exam_id


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "class_list.csv"
    subjects, students = read_class(path)

    # The user name and password come from the environment (PGUSER and
    # PGPASSWORD), never from the code.
    with psycopg.connect(host="localhost", dbname="mwangaza") as conn:
        exam_id = save(conn, subjects, students)
        top = conn.execute(
            """SELECT position, name, average, grade FROM student_results
               WHERE exam_id = %s ORDER BY position LIMIT 3""",
            (exam_id,),
        ).fetchall()

    print(f"Saved {len(students)} students and {len(subjects)} subjects for the {EXAM_NAME}, {EXAM_YEAR}.")
    print("Top three:")
    for position, name, average, grade in top:
        print(f"  {position}. {name}, average {average}, grade {grade}")


if __name__ == "__main__":
    main()
