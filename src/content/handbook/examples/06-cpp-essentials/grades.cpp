#include "grades.h"

#include <algorithm>
#include <numeric>
#include <stdexcept>

namespace results {

char gradeFor(int mark) {
    if (mark < 0 || mark > 100) {
        throw std::invalid_argument("a mark must be between 0 and 100");
    }
    if (mark >= 75) return 'A';
    if (mark >= 65) return 'B';
    if (mark >= 45) return 'C';
    if (mark >= 30) return 'D';
    return 'F';
}

int pointsFor(char grade) {
    switch (grade) {
        case 'A': return 1;
        case 'B': return 2;
        case 'C': return 3;
        case 'D': return 4;
        case 'F': return 5;
    }
    throw std::invalid_argument(std::string("not a grade: ") + grade);
}

Division divisionFor(const std::vector<char>& grades) {
    const std::size_t best = 7;
    if (grades.size() < best) return {0, "INC"};

    std::vector<int> points;
    for (char grade : grades) points.push_back(pointsFor(grade));
    std::sort(points.begin(), points.end());
    int total = std::accumulate(points.begin(), points.begin() + best, 0);

    if (total <= 17) return {total, "I"};
    if (total <= 21) return {total, "II"};
    if (total <= 25) return {total, "III"};
    if (total <= 33) return {total, "IV"};
    return {total, "0"};
}

}  // namespace results
