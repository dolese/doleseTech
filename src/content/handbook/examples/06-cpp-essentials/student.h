// A student and their marks for one examination.
#pragma once

#include <map>
#include <string>

#include "grades.h"
#include "person.h"

class Student : public Person {
public:
    Student(std::string name, std::string admissionNo);

    void setMark(const std::string& subject, int mark);
    double average() const;
    results::Division division() const;
    std::string describe() const override;

private:
    std::string admissionNo_;
    std::map<std::string, int> marks_;  // subject -> mark
};
