-- Mwangaza Secondary School - Form 4, Term 1 examination, 2026
-- Run after schema.sql. The database numbers rows in the order they are
-- added, so the students are 1 to 5, the subjects 1 to 3 and the exam 1.

INSERT INTO students (admission_no, name, sex) VALUES
  ('MSS/2023/001', 'Amina Juma', 'F'),
  ('MSS/2023/002', 'Baraka Mushi', 'M'),
  ('MSS/2023/003', 'Neema Kileo', 'F'),
  ('MSS/2023/004', 'Juma Hassan', 'M'),
  ('MSS/2023/005', 'Rehema Mollel', 'F');

INSERT INTO subjects (name) VALUES
  ('Mathematics'),
  ('English'),
  ('Biology');

INSERT INTO exams (name, year) VALUES
  ('Term 1 examination', 2026);

-- exam, student, subject, mark
INSERT INTO marks (exam_id, student_id, subject_id, mark) VALUES
  (1, 1, 1, 78), (1, 1, 2, 85), (1, 1, 3, 81),
  (1, 2, 1, 52), (1, 2, 2, 61), (1, 2, 3, 47),
  (1, 3, 1, 91), (1, 3, 2, 88), (1, 3, 3, 94),
  (1, 4, 1, 34), (1, 4, 2, 49), (1, 4, 3, 38),
  (1, 5, 1, 66), (1, 5, 2, 72), (1, 5, 3, 59);
