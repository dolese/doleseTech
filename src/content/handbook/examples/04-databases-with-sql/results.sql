-- Mwangaza Secondary School - grades, and the results of every exam
-- Run after schema.sql. Chapter 5 reads student_results from Python.

-- The grade for a mark or an average: the same rule as gradeFor in Chapter 3.
CREATE OR REPLACE FUNCTION grade_for(mark NUMERIC) RETURNS TEXT
LANGUAGE SQL IMMUTABLE
RETURN CASE
  WHEN mark >= 75 THEN 'A'
  WHEN mark >= 65 THEN 'B'
  WHEN mark >= 45 THEN 'C'
  WHEN mark >= 30 THEN 'D'
  ELSE 'F'
END;

-- One row for each student in each exam: average, grade and position.
CREATE OR REPLACE VIEW student_results AS
SELECT
  m.exam_id,
  s.id AS student_id,
  s.name,
  s.sex,
  ROUND(AVG(m.mark), 1) AS average,
  grade_for(ROUND(AVG(m.mark), 1)) AS grade,
  RANK() OVER (PARTITION BY m.exam_id ORDER BY ROUND(AVG(m.mark), 1) DESC) AS position
FROM marks AS m
JOIN students AS s ON s.id = m.student_id
GROUP BY m.exam_id, s.id;
