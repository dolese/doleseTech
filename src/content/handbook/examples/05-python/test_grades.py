"""Checks for grades.py. Run with: python -m unittest"""
import unittest

from grades import division_for, grade_for


class GradeTests(unittest.TestCase):
    def test_grade_boundaries(self):
        self.assertEqual(grade_for(75), "A")
        self.assertEqual(grade_for(74), "B")
        self.assertEqual(grade_for(65), "B")
        self.assertEqual(grade_for(45), "C")
        self.assertEqual(grade_for(44), "D")
        self.assertEqual(grade_for(30), "D")
        self.assertEqual(grade_for(29), "F")


class DivisionTests(unittest.TestCase):
    def test_only_the_best_seven_count(self):
        self.assertEqual(division_for(["A"] * 7 + ["F", "F"]), (7, "I"))

    def test_division_boundaries(self):
        self.assertEqual(division_for(["A"] + ["B"] * 2 + ["C"] * 4), (17, "I"))
        self.assertEqual(division_for(["B"] * 3 + ["C"] * 4), (18, "II"))
        self.assertEqual(division_for(["D"] * 2 + ["F"] * 5), (33, "IV"))
        self.assertEqual(division_for(["D"] + ["F"] * 6), (34, "0"))

    def test_fewer_than_seven_subjects(self):
        self.assertEqual(division_for(["A"] * 6), (None, "INC"))


if __name__ == "__main__":
    unittest.main()
