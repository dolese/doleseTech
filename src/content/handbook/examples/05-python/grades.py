"""Grades, points and divisions for Form 4 results."""

GRADE_POINTS = {"A": 1, "B": 2, "C": 3, "D": 4, "F": 5}
BEST_SUBJECTS = 7


def grade_for(mark):
    """The letter grade for a mark from 0 to 100."""
    if mark >= 75:
        return "A"
    elif mark >= 65:
        return "B"
    elif mark >= 45:
        return "C"
    elif mark >= 30:
        return "D"
    else:
        return "F"


def division_for(grades):
    """The points of the best seven grades, and the division they earn.

    A student with fewer than seven grades has no division yet: (None, "INC").
    """
    if len(grades) < BEST_SUBJECTS:
        return None, "INC"
    best = sorted(GRADE_POINTS[grade] for grade in grades)[:BEST_SUBJECTS]
    points = sum(best)
    if points <= 17:
        division = "I"
    elif points <= 21:
        division = "II"
    elif points <= 25:
        division = "III"
    elif points <= 33:
        division = "IV"
    else:
        division = "0"
    return points, division
