// Grades, points and divisions for Form 4 results.
#pragma once

#include <string>
#include <vector>

namespace results {

char gradeFor(int mark);
int pointsFor(char grade);

struct Division {
    int points;        // points of the best seven subjects; 0 if incomplete
    std::string name;  // "I" to "IV", "0", or "INC"
};

Division divisionFor(const std::vector<char>& grades);

}  // namespace results
