// Mwangaza Secondary School - results page
// Works out averages, grades and positions, and lets a teacher enter marks.

const SUBJECTS = ["Mathematics", "English", "Biology"];
const STORAGE_KEY = "mwangaza-form4-term1-2026";

// The marks from Chapter 2, now kept as data instead of typed into the table.
const startingStudents = [
  { name: "Amina Juma", sex: "F", marks: { Mathematics: 78, English: 85, Biology: 81 } },
  { name: "Baraka Mushi", sex: "M", marks: { Mathematics: 52, English: 61, Biology: 47 } },
  { name: "Neema Kileo", sex: "F", marks: { Mathematics: 91, English: 88, Biology: 94 } },
  { name: "Juma Hassan", sex: "M", marks: { Mathematics: 34, English: 49, Biology: 38 } },
  { name: "Rehema Mollel", sex: "F", marks: { Mathematics: 66, English: 72, Biology: 59 } },
];

let students = loadStudents();

// ---- Calculations ----

function gradeFor(mark) {
  if (mark >= 75) {
    return "A";
  } else if (mark >= 65) {
    return "B";
  } else if (mark >= 45) {
    return "C";
  } else if (mark >= 30) {
    return "D";
  } else {
    return "F";
  }
}

function roundTo1(number) {
  return Math.round(number * 10) / 10;
}

function averageOf(student) {
  let total = 0;
  for (const subject of SUBJECTS) {
    total = total + student.marks[subject];
  }
  return roundTo1(total / SUBJECTS.length);
}

// Position 1 has the highest average. Students with the same average share
// a position, and the next position is skipped: 1, 2, 2, 4.
function positionOf(student) {
  let higher = 0;
  for (const other of students) {
    if (averageOf(other) > averageOf(student)) {
      higher = higher + 1;
    }
  }
  return higher + 1;
}

// Returns what is wrong with a typed mark, or "" if it is fine.
function checkMark(text) {
  if (text.trim() === "") {
    return "Type a mark.";
  }
  const mark = Number(text);
  if (!Number.isInteger(mark)) {
    return "Marks are whole numbers, such as 67.";
  }
  if (mark < 0 || mark > 100) {
    return "A mark must be between 0 and 100.";
  }
  return "";
}

// ---- Saving in the browser ----

function loadStudents() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved !== null) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.warn("The saved marks could not be read, so the originals are used.", error);
    }
  }
  return structuredClone(startingStudents);
}

function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

// ---- Showing the results ----

const tableBody = document.querySelector("#results-body");

function addCell(row, text, className) {
  const cell = document.createElement("td");
  cell.textContent = text;
  if (className) {
    cell.className = className;
  }
  row.appendChild(cell);
  return cell;
}

function renderTable() {
  tableBody.textContent = "";

  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    const average = averageOf(student);
    const grade = gradeFor(average);
    const row = document.createElement("tr");

    addCell(row, i + 1);
    addCell(row, student.name);
    addCell(row, student.sex);
    for (const subject of SUBJECTS) {
      addCell(row, student.marks[subject], "num");
    }
    addCell(row, average.toFixed(1), "num");

    const badge = document.createElement("span");
    badge.className = "grade grade-" + grade.toLowerCase();
    badge.textContent = grade;
    addCell(row, "").appendChild(badge);

    addCell(row, positionOf(student), "num");
    tableBody.appendChild(row);
  }
}

function renderSummary() {
  let total = 0;
  let top = students[0];
  for (const student of students) {
    total = total + averageOf(student);
    if (averageOf(student) > averageOf(top)) {
      top = student;
    }
  }

  document.querySelector("#count").textContent = students.length;
  document.querySelector("#class-average").textContent = (total / students.length).toFixed(1);
  document.querySelector("#top-student").textContent = top.name;
}

function render() {
  renderTable();
  renderSummary();
}

// ---- Entering marks ----

const form = document.querySelector("#mark-form");
const studentSelect = document.querySelector("#student");
const subjectSelect = document.querySelector("#subject");
const markInput = document.querySelector("#mark");
const message = document.querySelector("#message");
const resetButton = document.querySelector("#reset");

// Fill the drop-down lists from the data, so they always match the table.
function fillChoices() {
  for (let i = 0; i < students.length; i++) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = students[i].name;
    studentSelect.appendChild(option);
  }
  for (const subject of SUBJECTS) {
    const option = document.createElement("option");
    option.textContent = subject;
    subjectSelect.appendChild(option);
  }
}

function showMessage(text, kind) {
  message.textContent = text;
  message.className = "message " + kind;
}

markInput.addEventListener("input", function () {
  showMessage(checkMark(markInput.value), "error");
});

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const problem = checkMark(markInput.value);
  if (problem !== "") {
    showMessage(problem, "error");
    markInput.focus();
    return;
  }

  const student = students[Number(studentSelect.value)];
  const subject = subjectSelect.value;
  const mark = Number(markInput.value);

  student.marks[subject] = mark;
  saveStudents();
  render();

  showMessage(`Saved: ${student.name}, ${subject} ${mark}.`, "success");
  markInput.value = "";
});

resetButton.addEventListener("click", function () {
  if (confirm("Put back the original marks? Marks you entered will be lost.")) {
    localStorage.removeItem(STORAGE_KEY);
    students = structuredClone(startingStudents);
    render();
    showMessage("The original marks are back.", "success");
  }
});

// ---- Start ----

fillChoices();
render();
