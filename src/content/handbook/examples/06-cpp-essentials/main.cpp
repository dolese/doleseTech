// Form 4 results: classes, inheritance and the standard library.
#include <algorithm>
#include <iomanip>
#include <iostream>
#include <map>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include "person.h"
#include "student.h"

// Lower is better: points of the best seven, with incomplete results last.
int rankOf(const Student& student) {
    results::Division d = student.division();
    return d.name == "INC" ? 100 : d.points;
}

int main() {
    const std::vector<std::string> subjects = {"Civics",  "History",     "Geography", "Kiswahili", "English",
                                               "Biology", "Mathematics", "Chemistry", "Physics"};
    const std::vector<std::vector<int>> marks = {
        {82, 76, 79, 88, 85, 81, 78, 74, 70},
        {58, 49, 61, 66, 61, 47, 52, 44, 40},
        {90, 85, 88, 92, 88, 94, 91, 86, 89},
        {38, 41, 35, 52, 49, 38, 34, 29, 31},
        {68, 70, 63, 75, 72, 59, 66, 58, 61},
    };
    std::vector<Student> students = {
        {"Amina Juma", "MSS/2023/001"},  {"Baraka Mushi", "MSS/2023/002"},
        {"Neema Kileo", "MSS/2023/003"}, {"Juma Hassan", "MSS/2023/004"},
        {"Rehema Mollel", "MSS/2023/005"},
    };

    for (std::size_t i = 0; i < students.size(); ++i) {
        for (std::size_t j = 0; j < subjects.size(); ++j) {
            students[i].setMark(subjects[j], marks[i][j]);
        }
    }

    // Best first: fewest points, then the higher average.
    std::sort(students.begin(), students.end(), [](const Student& a, const Student& b) {
        if (rankOf(a) != rankOf(b)) return rankOf(a) < rankOf(b);
        return a.average() > b.average();
    });

    std::cout << std::left << std::setw(4) << "No." << std::setw(15) << "Name" << std::right
              << std::setw(8) << "Average" << std::setw(8) << "Points" << "  Division\n";

    std::map<std::string, int> count;
    int number = 1;
    for (const Student& s : students) {
        results::Division d = s.division();
        std::cout << std::left << std::setw(4) << number++ << std::setw(15) << s.name() << std::right
                  << std::fixed << std::setprecision(1) << std::setw(8) << s.average()
                  << std::setw(8) << d.points << "  " << d.name << '\n';
        ++count[d.name];
    }

    std::cout << "\nDivisions:";
    for (const auto& [name, n] : count) std::cout << ' ' << name << '=' << n;
    std::cout << '\n';

    // A mistake in the data is refused, not quietly accepted.
    try {
        students.front().setMark("Biology", 147);
    } catch (const std::invalid_argument& error) {
        std::cout << "\nRefused: " << error.what() << '\n';
    }

    // A teacher and a student are both people, so one list can hold both.
    std::vector<std::unique_ptr<Person>> people;
    people.push_back(std::make_unique<Teacher>("Mwl. Grace Mushi", "Biology"));
    people.push_back(std::make_unique<Student>(students.front()));

    std::cout << '\n';
    for (const auto& person : people) std::cout << person->describe() << '\n';

    return 0;
}
