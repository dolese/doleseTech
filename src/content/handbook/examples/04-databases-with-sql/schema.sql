-- Mwangaza Secondary School - results database
-- Run on a practice database. The first line deletes these tables, so the
-- file can be run again to start over. Never run it on real school data.

DROP TABLE IF EXISTS marks, exams, subjects, students CASCADE;

CREATE TABLE students (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  admission_no  TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  sex           TEXT NOT NULL CHECK (sex IN ('F', 'M'))
);

CREATE TABLE subjects (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE
);

CREATE TABLE exams (
  id    INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name  TEXT NOT NULL,
  year  INTEGER NOT NULL,
  UNIQUE (name, year)
);

CREATE TABLE marks (
  exam_id     INTEGER NOT NULL REFERENCES exams (id),
  student_id  INTEGER NOT NULL REFERENCES students (id),
  subject_id  INTEGER NOT NULL REFERENCES subjects (id),
  mark        INTEGER NOT NULL CHECK (mark BETWEEN 0 AND 100),
  PRIMARY KEY (exam_id, student_id, subject_id)
);
