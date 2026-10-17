"""Read a class list, work out every student's results, and save them."""
import csv
import sys

from grades import division_for, grade_for

INFO_COLUMNS = ["admission_no", "name", "sex"]


def parse_mark(text, where):
    """A mark from the file: a whole number from 0 to 100, or None if blank."""
    text = text.strip()
    if text == "":
        return None
    try:
        mark = int(text)
    except ValueError:
        raise ValueError(f"{where}: '{text}' is not a whole number")
    if mark < 0 or mark > 100:
        raise ValueError(f"{where}: {mark} is not between 0 and 100")
    return mark


def read_class(path):
    """The subjects, and one dictionary for each student in the file."""
    with open(path, newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        subjects = [column for column in reader.fieldnames if column not in INFO_COLUMNS]
        students = []
        for line, row in enumerate(reader, start=2):
            marks = {}
            for subject in subjects:
                mark = parse_mark(row[subject], f"line {line}, {subject}")
                if mark is not None:
                    marks[subject] = mark
            students.append({
                "admission_no": row["admission_no"],
                "name": row["name"],
                "sex": row["sex"],
                "marks": marks,
            })
    return subjects, students


def results_for(student):
    """The student, with their average, points and division added."""
    marks = student["marks"]
    grades = [grade_for(mark) for mark in marks.values()]
    points, division = division_for(grades)
    average = round(sum(marks.values()) / len(marks), 1) if marks else 0.0
    return {**student, "average": average, "points": points, "division": division}


def sort_key(result):
    """Best first: fewest points, then highest average. Incomplete results last."""
    if result["points"] is None:
        return (1, 0, -result["average"])
    return (0, result["points"], -result["average"])


def save_results(path, results):
    with open(path, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["admission_no", "name", "sex", "subjects", "average", "points", "division"])
        for r in results:
            writer.writerow([r["admission_no"], r["name"], r["sex"], len(r["marks"]),
                             r["average"], r["points"] or "", r["division"]])


def main():
    path = sys.argv[1] if len(sys.argv) > 1 else "class_list.csv"
    try:
        subjects, students = read_class(path)
    except (OSError, ValueError) as error:
        print(f"Could not read the class list: {error}")
        sys.exit(1)

    results = sorted((results_for(s) for s in students), key=sort_key)

    print(f"{len(results)} students, {len(subjects)} subjects\n")
    print(f"{'No.':<4}{'Name':<15}{'Sex':<4}{'Average':>8}{'Points':>8}  Division")
    for number, r in enumerate(results, start=1):
        points = "-" if r["points"] is None else r["points"]
        print(f"{number:<4}{r['name']:<15}{r['sex']:<4}{r['average']:>8.1f}{points:>8}  {r['division']}")

    counts = {}
    for r in results:
        counts[r["division"]] = counts.get(r["division"], 0) + 1
    summary = "   ".join(f"{d}: {counts.get(d, 0)}" for d in ["I", "II", "III", "IV", "0", "INC"])
    print(f"\nDivisions   {summary}")

    save_results("results.csv", results)
    print("Saved results.csv")


if __name__ == "__main__":
    main()
