#include "student.h"

#include <stdexcept>
#include <utility>
#include <vector>

Student::Student(std::string name, std::string admissionNo)
    : Person(std::move(name)), admissionNo_(std::move(admissionNo)) {}

void Student::setMark(const std::string& subject, int mark) {
    if (mark < 0 || mark > 100) {
        throw std::invalid_argument(name() + ", " + subject + ": " + std::to_string(mark) +
                                    " is not between 0 and 100");
    }
    marks_[subject] = mark;
}

double Student::average() const {
    if (marks_.empty()) return 0.0;
    int total = 0;
    for (const auto& [subject, mark] : marks_) total += mark;
    return static_cast<double>(total) / marks_.size();
}

results::Division Student::division() const {
    std::vector<char> grades;
    for (const auto& [subject, mark] : marks_) grades.push_back(results::gradeFor(mark));
    return results::divisionFor(grades);
}

std::string Student::describe() const {
    return name() + " (" + admissionNo_ + "), " + std::to_string(marks_.size()) + " subjects";
}
