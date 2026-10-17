// People in a school: what every person has, and how each kind differs.
#pragma once

#include <string>
#include <utility>

class Person {
public:
    explicit Person(std::string name) : name_(std::move(name)) {}
    virtual ~Person() = default;

    const std::string& name() const { return name_; }

    // Every kind of person describes themselves in their own way.
    virtual std::string describe() const = 0;

private:
    std::string name_;
};

class Teacher : public Person {
public:
    Teacher(std::string name, std::string subject)
        : Person(std::move(name)), subject_(std::move(subject)) {}

    std::string describe() const override {
        return name() + " teaches " + subject_;
    }

private:
    std::string subject_;
};
