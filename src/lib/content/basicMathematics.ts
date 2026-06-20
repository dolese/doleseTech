import type { SubjectContent } from "./types";

/** O-Level Basic Mathematics — authored competence-based content + notes. */
export const basicMathematics: SubjectContent = {
  "Form I|Numbers (Base Ten)": {
    mainCompetence: "Use whole numbers and the four basic operations to solve problems in everyday life.",
    specificCompetences: [
      "Read, write and identify the place value of numbers in base ten.",
      "Add, subtract, multiply and divide whole numbers and integers.",
    ],
    activities:
      "In groups, learners use place-value charts and number lines to represent numbers and carry out operations, then create and solve real-life money and distance problems.",
    notes: {
      intro:
        "Numbers are symbols used to represent quantity. In the base ten system every digit has a place value that is ten times the value of the digit to its right.",
      sections: [
        {
          heading: "Place value in base ten",
          body: "Base ten uses the digits 0–9. Reading from the right, the place values are ones, tens, hundreds, thousands and so on. For example, in 3 426 the digit 4 stands for 4 hundreds.",
        },
        {
          heading: "Types of numbers",
          points: [
            "Natural (counting) numbers: 1, 2, 3, …",
            "Whole numbers: 0, 1, 2, 3, …",
            "Integers: …, −2, −1, 0, 1, 2, … (include negative numbers).",
          ],
        },
        {
          heading: "Operations on whole numbers",
          points: [
            "Addition and subtraction are inverse operations.",
            "Multiplication is repeated addition; division is repeated subtraction.",
            "When an expression has several operations, follow the order BODMAS.",
          ],
        },
      ],
    },
  },

  "Form I|Fractions, Decimals & Percentage": {
    mainCompetence: "Apply fractions, decimals and percentages to solve problems involving parts of quantities and money.",
    specificCompetences: [
      "Simplify, compare and perform operations on fractions and decimals.",
      "Convert between fractions, decimals and percentages and apply them to real situations.",
    ],
    activities:
      "Learners fold paper and share objects to model fractions, convert between the three forms, and solve market and price problems, explaining their reasoning.",
    notes: {
      intro:
        "A fraction represents a part of a whole. Decimals and percentages are simply other ways of writing the same parts.",
      sections: [
        {
          heading: "Fractions",
          body: "A fraction a/b has a numerator a and a denominator b. Equivalent fractions have the same value (1/2 = 2/4). To add or subtract, use a common denominator; to multiply, multiply numerators and denominators; to divide, multiply by the reciprocal.",
        },
        {
          heading: "Decimals",
          body: "A decimal is a fraction whose denominator is a power of ten. The decimal point separates the whole-number part from the fractional part. When adding or subtracting, align the decimal points.",
        },
        {
          heading: "Percentage",
          body: "Percentage means 'out of a hundred'. To change a fraction to a percentage, multiply by 100%. Percentages are used for discounts, interest, and profit or loss.",
        },
      ],
    },
  },

  "Form I|Units": {
    mainCompetence: "Use standard units of measurement to express and convert quantities in daily life.",
    specificCompetences: [
      "Identify and convert units of length, mass, capacity and time.",
      "Apply units to solve practical measurement problems.",
    ],
    activities:
      "Learners measure objects around the school, record results in a table and convert between units.",
    notes: {
      intro:
        "A unit is a standard quantity used for measurement. Using common units allows people to compare measurements.",
      sections: [
        {
          heading: "Common metric units",
          points: [
            "Length: millimetre, centimetre, metre, kilometre.",
            "Mass: gram, kilogram, tonne.",
            "Capacity: millilitre, litre.",
            "Time: second, minute, hour.",
          ],
        },
        {
          heading: "Converting units",
          body: "To convert from a larger unit to a smaller one, multiply; from a smaller unit to a larger one, divide. For example, 1 m = 100 cm, so 3 m = 300 cm.",
        },
      ],
    },
  },

  "Form I|Approximations": {
    mainCompetence: "Use rounding and significant figures to estimate quantities and check the reasonableness of answers.",
    specificCompetences: [
      "Round off numbers to a given number of decimal places and significant figures.",
      "Estimate results and identify errors in calculations.",
    ],
    activities:
      "Learners estimate quantities such as distances or crowd sizes, then calculate the exact value and compare it with their estimate.",
    notes: {
      intro:
        "Approximation is finding a value that is close to the exact one. It is useful for quick estimates and for checking whether an answer is reasonable.",
      sections: [
        {
          heading: "Rounding off",
          body: "To round to a given place, look at the next digit: if it is 5 or more, round up; otherwise round down. For example, 3.78 ≈ 3.8 to one decimal place.",
        },
        {
          heading: "Significant figures",
          points: [
            "All non-zero digits are significant.",
            "Zeros between non-zero digits are significant.",
            "Leading zeros are not significant.",
          ],
        },
      ],
    },
  },

  "Form I|Geometry": {
    mainCompetence: "Identify geometric figures and use the properties of lines and angles to solve problems.",
    specificCompetences: [
      "Describe and measure points, lines and angles.",
      "Apply angle properties on a straight line and at a point.",
    ],
    activities:
      "Learners use rulers and protractors to draw and measure angles, then investigate relationships between angles.",
    notes: {
      intro: "Geometry is the study of shapes, sizes and the properties of space.",
      sections: [
        {
          heading: "Basic terms",
          points: [
            "A point shows position; a line has length only.",
            "An angle is formed when two lines meet at a point.",
            "Types of angles: acute (<90°), right (90°), obtuse (between 90° and 180°), reflex (>180°).",
          ],
        },
        {
          heading: "Angle properties",
          points: [
            "Angles on a straight line add up to 180°.",
            "Angles at a point add up to 360°.",
            "Vertically opposite angles are equal.",
          ],
        },
      ],
    },
  },

  "Form I|Algebra": {
    mainCompetence: "Use algebraic symbols and simple equations to represent and solve everyday problems.",
    specificCompetences: [
      "Form and simplify algebraic expressions.",
      "Solve simple linear equations in one unknown.",
    ],
    activities:
      "Learners translate word problems into expressions and equations, solve them, and check their solutions by substitution.",
    notes: {
      intro:
        "Algebra uses letters (variables) to represent unknown numbers, allowing us to write general rules and solve problems.",
      sections: [
        {
          heading: "Algebraic expressions",
          body: "An expression combines variables and numbers using operations, e.g. 2x + 3. Like terms (such as 2x and 5x) can be added or subtracted; unlike terms cannot.",
        },
        {
          heading: "Linear equations",
          body: "An equation states that two expressions are equal. To solve it, perform the same operation on both sides until the variable stands alone, e.g. x + 5 = 12 gives x = 7.",
        },
      ],
    },
  },

  "Form I|Ratio, Profit & Loss": {
    mainCompetence: "Apply ratio, proportion and percentage to trade and sharing situations.",
    specificCompetences: [
      "Express and simplify ratios and divide quantities in a given ratio.",
      "Calculate profit, loss and percentage profit or loss.",
    ],
    activities:
      "Learners role-play buying and selling goods, computing profit, loss and sharing money in given ratios.",
    notes: {
      intro: "A ratio compares two or more quantities of the same kind. Profit and loss arise in buying and selling.",
      sections: [
        {
          heading: "Ratio and proportion",
          body: "A ratio a : b compares quantities. To share an amount in a ratio, add the parts and find the value of one part. A proportion states that two ratios are equal.",
        },
        {
          heading: "Profit and loss",
          points: [
            "Profit = Selling Price − Buying Price (when SP > BP).",
            "Loss = Buying Price − Selling Price (when BP > SP).",
            "Percentage profit = (Profit ÷ Buying Price) × 100%.",
          ],
        },
      ],
    },
  },

  "Form I|Coordinate Geometry": {
    mainCompetence: "Locate and plot points on the Cartesian plane and interpret their positions.",
    specificCompetences: [
      "Identify the x- and y-axes and read the coordinates of points.",
      "Plot points and draw simple figures on the plane.",
    ],
    activities:
      "Learners plot given coordinates on graph paper to form shapes or pictures and describe the positions of points.",
    notes: {
      intro:
        "The Cartesian plane is formed by two perpendicular number lines: the x-axis (horizontal) and the y-axis (vertical), meeting at the origin (0, 0).",
      sections: [
        {
          heading: "Coordinates",
          body: "A point is written as (x, y), where x is the horizontal distance and y the vertical distance from the origin. For example, (3, 2) is 3 units right and 2 units up.",
        },
        {
          heading: "Quadrants",
          body: "The two axes divide the plane into four regions called quadrants, numbered anticlockwise starting from the top right.",
        },
      ],
    },
  },

  "Form I|Perimeters & Areas": {
    mainCompetence: "Calculate the perimeters and areas of common plane figures and apply them to real problems.",
    specificCompetences: [
      "Find the perimeter of rectangles, triangles and circles.",
      "Calculate the areas of rectangles, triangles, parallelograms and circles.",
    ],
    activities:
      "Learners measure classroom surfaces and the school compound, then compute perimeter and area and compare their methods.",
    notes: {
      intro: "Perimeter is the total distance around a figure; area is the amount of surface it covers.",
      sections: [
        {
          heading: "Perimeter",
          points: [
            "Rectangle: P = 2(l + w).",
            "Triangle: the sum of the three sides.",
            "Circle (circumference): C = 2πr.",
          ],
        },
        {
          heading: "Area",
          points: ["Rectangle: A = l × w.", "Triangle: A = ½ × base × height.", "Circle: A = πr²."],
        },
      ],
    },
  },

  // ── Form II ──────────────────────────────────────────────────
  "Form II|Exponents & Radicals": {
    mainCompetence: "Use the laws of exponents and radicals to simplify expressions and solve problems.",
    specificCompetences: [
      "Apply the laws of indices to simplify powers.",
      "Simplify and rationalise simple radicals (surds).",
    ],
    activities:
      "Learners derive the laws of indices from examples, then simplify expressions and present their steps on the board.",
    notes: {
      intro: "An exponent (index) shows how many times a base number is multiplied by itself; a radical is the inverse, a root.",
      sections: [
        {
          heading: "Laws of exponents",
          points: ["aᵐ × aⁿ = aᵐ⁺ⁿ", "aᵐ ÷ aⁿ = aᵐ⁻ⁿ", "(aᵐ)ⁿ = aᵐⁿ", "a⁰ = 1 and a⁻ⁿ = 1/aⁿ"],
        },
        {
          heading: "Radicals (surds)",
          body: "A radical such as √a is a number whose square is a. Surds are simplified using √(ab) = √a × √b, and a denominator is rationalised by multiplying by a suitable surd.",
        },
      ],
    },
  },

  "Form II|Algebra": {
    mainCompetence: "Manipulate algebraic expressions and solve linear equations and inequalities.",
    specificCompetences: [
      "Expand, factorise and simplify algebraic expressions.",
      "Solve linear equations and simultaneous equations in two unknowns.",
    ],
    activities:
      "Learners model real problems with simultaneous equations and solve them by substitution and elimination, then verify the solutions.",
    notes: {
      intro: "Algebra in Form II extends to expansion, factorisation and solving systems of equations.",
      sections: [
        {
          heading: "Expansion and factorisation",
          body: "To expand, remove brackets using the distributive law, e.g. a(b + c) = ab + ac. Factorisation is the reverse — writing an expression as a product of its factors.",
        },
        {
          heading: "Simultaneous equations",
          body: "Two equations with two unknowns are solved together by substitution or elimination, giving the values that satisfy both equations at once.",
        },
      ],
    },
  },

  "Form II|Quadratic Equations": {
    mainCompetence: "Solve quadratic equations and apply them to real-life situations.",
    specificCompetences: [
      "Solve quadratic equations by factorisation and by the quadratic formula.",
      "Form quadratic equations from word problems.",
    ],
    activities:
      "Learners form quadratic equations from area and number problems and solve them by more than one method.",
    notes: {
      intro: "A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0. It can have two, one or no real roots.",
      sections: [
        {
          heading: "Solving by factorisation",
          body: "Write the equation as a product of two factors equal to zero, then set each factor to zero, e.g. x² − 5x + 6 = 0 gives (x − 2)(x − 3) = 0, so x = 2 or x = 3.",
        },
        {
          heading: "The quadratic formula",
          body: "When factorisation is difficult, use x = [−b ± √(b² − 4ac)] / 2a. The expression b² − 4ac (the discriminant) tells the number of real roots.",
        },
      ],
    },
  },

  "Form II|Logarithms": {
    mainCompetence: "Use logarithms to simplify calculations involving multiplication, division and powers.",
    specificCompetences: [
      "Relate logarithms to indices and read logarithm tables.",
      "Apply the laws of logarithms to evaluate expressions.",
    ],
    activities:
      "Learners convert between index and logarithm form and use the laws of logarithms to evaluate expressions.",
    notes: {
      intro: "A logarithm is the index (power) to which a base must be raised to give a number: if aˣ = n then logₐ n = x.",
      sections: [
        {
          heading: "Laws of logarithms",
          points: ["log(MN) = log M + log N", "log(M/N) = log M − log N", "log(Mⁿ) = n log M"],
        },
        {
          heading: "Common logarithms",
          body: "Common logarithms use base 10 and were traditionally read from tables (characteristic and mantissa) to simplify long calculations.",
        },
      ],
    },
  },

  "Form II|Congruence": {
    mainCompetence: "Identify congruent figures and use congruence to solve geometric problems.",
    specificCompetences: [
      "State and apply the conditions for congruence of triangles.",
      "Use congruence to find unknown sides and angles.",
    ],
    activities:
      "Learners cut out and superimpose triangles to test congruence conditions, then justify their conclusions.",
    notes: {
      intro: "Two figures are congruent if they have exactly the same shape and size, so one fits exactly onto the other.",
      sections: [
        {
          heading: "Conditions for congruent triangles",
          points: ["SSS — three sides equal.", "SAS — two sides and the included angle equal.", "ASA — two angles and the included side equal.", "RHS — right angle, hypotenuse and one side equal."],
        },
      ],
    },
  },

  "Form II|Similarity": {
    mainCompetence: "Use similarity of figures to solve problems involving scale and proportion.",
    specificCompetences: [
      "State the conditions for similarity of triangles.",
      "Use ratios of corresponding sides to find unknown lengths.",
    ],
    activities:
      "Learners use shadows or scale drawings to estimate heights of tall objects using similar triangles.",
    notes: {
      intro: "Two figures are similar if they have the same shape but not necessarily the same size; corresponding angles are equal and corresponding sides are proportional.",
      sections: [
        {
          heading: "Similar triangles",
          body: "If two triangles are similar, the ratios of their corresponding sides are equal. This is used to find unknown lengths and to make scale drawings and maps.",
        },
      ],
    },
  },

  "Form II|Geometrical Transformations": {
    mainCompetence: "Describe and perform transformations of figures on the plane.",
    specificCompetences: [
      "Perform reflection, rotation, translation and enlargement.",
      "Describe a transformation given an object and its image.",
    ],
    activities:
      "Learners transform shapes on graph paper and describe each transformation fully (type and parameters).",
    notes: {
      intro: "A transformation changes the position, orientation or size of a figure. The original is the object and the result is the image.",
      sections: [
        {
          heading: "Types of transformation",
          points: [
            "Reflection — a flip across a mirror line.",
            "Rotation — a turn about a fixed point through an angle.",
            "Translation — a slide in a given direction.",
            "Enlargement — a change of size by a scale factor about a centre.",
          ],
        },
      ],
    },
  },

  "Form II|Pythagoras' Theorem": {
    mainCompetence: "Apply Pythagoras' theorem to solve problems involving right-angled triangles.",
    specificCompetences: [
      "State Pythagoras' theorem.",
      "Use the theorem to find an unknown side of a right-angled triangle.",
    ],
    activities:
      "Learners verify the theorem by measuring right-angled triangles, then apply it to real distances (e.g. ladders, ramps).",
    notes: {
      intro: "Pythagoras' theorem relates the three sides of a right-angled triangle.",
      sections: [
        {
          heading: "The theorem",
          body: "In a right-angled triangle, the square of the hypotenuse (the longest side) equals the sum of the squares of the other two sides: a² + b² = c². It is used to find an unknown side when the other two are known.",
        },
      ],
    },
  },

  "Form II|Trigonometry": {
    mainCompetence: "Use trigonometric ratios to solve problems involving right-angled triangles.",
    specificCompetences: [
      "Define sine, cosine and tangent of an angle.",
      "Use the ratios to find unknown sides and angles.",
    ],
    activities:
      "Learners measure angles of elevation with a simple clinometer and use trigonometric ratios to find heights.",
    notes: {
      intro: "Trigonometry studies the relationship between the angles and sides of triangles.",
      sections: [
        {
          heading: "The three ratios",
          points: ["sin θ = opposite ÷ hypotenuse", "cos θ = adjacent ÷ hypotenuse", "tan θ = opposite ÷ adjacent"],
        },
        {
          heading: "Applications",
          body: "These ratios are used to find unknown sides and angles, and to solve problems involving angles of elevation and depression.",
        },
      ],
    },
  },

  "Form II|Sets": {
    mainCompetence: "Use sets and set operations to organise and classify information.",
    specificCompetences: [
      "Describe sets and use set notation.",
      "Perform union, intersection and complement and use Venn diagrams.",
    ],
    activities:
      "Learners classify classroom items into sets and represent the relationships using Venn diagrams.",
    notes: {
      intro: "A set is a well-defined collection of objects called elements.",
      sections: [
        {
          heading: "Set operations",
          points: [
            "Union (A ∪ B): elements in A or B or both.",
            "Intersection (A ∩ B): elements in both A and B.",
            "Complement (A′): elements not in A.",
          ],
        },
        {
          heading: "Venn diagrams",
          body: "Venn diagrams use circles within a rectangle (the universal set) to show the relationships between sets and to solve problems on numbers of elements.",
        },
      ],
    },
  },

  "Form II|Statistics": {
    mainCompetence: "Collect, present and interpret simple statistical data.",
    specificCompetences: [
      "Organise data in frequency tables.",
      "Draw and interpret bar charts, pictograms and pie charts.",
    ],
    activities:
      "Learners collect data from classmates (e.g. ages, favourite subjects), tabulate it and present it as charts.",
    notes: {
      intro: "Statistics is the study of collecting, organising, presenting and interpreting data.",
      sections: [
        {
          heading: "Presenting data",
          points: [
            "Frequency table — shows how often each value occurs.",
            "Bar chart — bars whose heights show frequency.",
            "Pie chart — a circle divided into sectors proportional to frequency.",
          ],
        },
      ],
    },
  },

  // ── Form III ─────────────────────────────────────────────────
  "Form III|Relations": {
    mainCompetence: "Use relations to describe how members of two sets are connected.",
    specificCompetences: ["Represent relations by arrow diagrams and graphs.", "Identify the domain and range of a relation."],
    activities: "Learners map members of one set to another (e.g. pupils to ages) and represent the relation in different ways.",
    notes: {
      intro: "A relation is a rule that connects the elements of one set (the domain) to the elements of another (the range).",
      sections: [
        {
          heading: "Representing relations",
          body: "A relation can be shown by a set of ordered pairs, an arrow diagram, a table or a graph. The domain is the set of inputs and the range is the set of outputs.",
        },
      ],
    },
  },

  "Form III|Functions": {
    mainCompetence: "Use functions to model and solve real-life problems.",
    specificCompetences: ["Distinguish a function from a general relation.", "Evaluate and sketch simple linear and quadratic functions."],
    activities: "Learners test relations to decide whether they are functions and sketch the graphs of given functions.",
    notes: {
      intro: "A function is a special relation in which each input has exactly one output.",
      sections: [
        {
          heading: "Function notation",
          body: "A function may be written as f(x). To evaluate f(x) for a value, substitute the value for x, e.g. if f(x) = 2x + 1 then f(3) = 7.",
        },
        {
          heading: "Graphs of functions",
          body: "A linear function gives a straight-line graph; a quadratic function gives a curve called a parabola.",
        },
      ],
    },
  },

  "Form III|Statistics": {
    mainCompetence: "Summarise data using measures of central tendency and suitable graphs.",
    specificCompetences: ["Calculate the mean, median and mode.", "Draw and interpret histograms and frequency polygons."],
    activities: "Learners compute the mean, median and mode for collected data and discuss which best represents it.",
    notes: {
      intro: "Measures of central tendency are single values that represent the centre of a set of data.",
      sections: [
        {
          heading: "Mean, median and mode",
          points: [
            "Mean — the sum of values divided by their number.",
            "Median — the middle value when data is arranged in order.",
            "Mode — the value that occurs most often.",
          ],
        },
      ],
    },
  },

  "Form III|Rates & Variations": {
    mainCompetence: "Apply rates and variation to solve real-life problems.",
    specificCompetences: ["Work with rates such as speed and density.", "Solve problems on direct and inverse variation."],
    activities: "Learners investigate how distance, speed and time are related using journeys, and tabulate varying quantities.",
    notes: {
      intro: "A rate compares two quantities of different kinds; variation describes how one quantity changes with another.",
      sections: [
        {
          heading: "Rates",
          body: "A rate is a ratio of two different quantities, such as speed = distance ÷ time, or density = mass ÷ volume.",
        },
        {
          heading: "Direct and inverse variation",
          body: "In direct variation, as one quantity increases the other increases in the same ratio. In inverse variation, as one increases the other decreases.",
        },
      ],
    },
  },

  "Form III|Sequences & Series": {
    mainCompetence: "Recognise patterns and use sequences and series to solve problems.",
    specificCompetences: ["Find terms of arithmetic and geometric progressions.", "Find the sum of an arithmetic or geometric series."],
    activities: "Learners study number patterns and savings problems, deriving and applying the formulae.",
    notes: {
      intro: "A sequence is an ordered list of numbers following a rule; a series is the sum of the terms of a sequence.",
      sections: [
        {
          heading: "Arithmetic progression (AP)",
          body: "An AP has a common difference d. The nth term is aₙ = a + (n − 1)d, where a is the first term.",
        },
        {
          heading: "Geometric progression (GP)",
          body: "A GP has a common ratio r. The nth term is aₙ = arⁿ⁻¹. GPs model growth such as compound interest.",
        },
      ],
    },
  },

  "Form III|Circles": {
    mainCompetence: "Use the properties of circles to solve geometric problems.",
    specificCompetences: ["Identify parts of a circle.", "Apply circle theorems on chords and angles."],
    activities: "Learners draw circles and measure angles to discover circle theorems, then apply them.",
    notes: {
      intro: "A circle is the set of all points at a fixed distance (the radius) from a fixed point (the centre).",
      sections: [
        {
          heading: "Parts of a circle",
          points: ["Radius, diameter and chord.", "Arc, sector and segment.", "Tangent — a line touching the circle at one point."],
        },
        {
          heading: "Circle theorems",
          points: [
            "The angle at the centre is twice the angle at the circumference on the same arc.",
            "Angles in the same segment are equal.",
            "The angle in a semicircle is 90°.",
          ],
        },
      ],
    },
  },

  "Form III|The Earth as a Sphere": {
    mainCompetence: "Use latitude and longitude to locate places and find distances on the Earth.",
    specificCompetences: ["Describe latitudes and longitudes.", "Calculate distances along great circles."],
    activities: "Learners use a globe to locate places by their coordinates and estimate distances between them.",
    notes: {
      intro: "The Earth is approximately a sphere. Position on its surface is given using latitude and longitude.",
      sections: [
        {
          heading: "Latitude and longitude",
          body: "Latitudes are circles parallel to the Equator (0°–90° N or S); longitudes (meridians) run from pole to pole (0°–180° E or W) from the Greenwich meridian.",
        },
        {
          heading: "Distances",
          body: "Distances along a great circle can be found from the angle subtended at the centre, since 1° along a great circle ≈ 60 nautical miles.",
        },
      ],
    },
  },

  "Form III|Accounts": {
    mainCompetence: "Keep simple financial records and prepare basic accounts.",
    specificCompetences: ["Record transactions in a ledger.", "Prepare a simple trial balance."],
    activities: "Learners record sample transactions of a small business and prepare a trial balance.",
    notes: {
      intro: "Accounts are records of money received and paid out by a person or business.",
      sections: [
        {
          heading: "Double-entry principle",
          body: "Every transaction is recorded twice — as a debit in one account and a credit in another — so that total debits equal total credits.",
        },
        {
          heading: "Trial balance",
          body: "A trial balance lists the balances of all accounts to check that total debits equal total credits before preparing final accounts.",
        },
      ],
    },
  },

  // ── Form IV ──────────────────────────────────────────────────
  "Form IV|Coordinate Geometry": {
    mainCompetence: "Use coordinate geometry to study lines and their properties.",
    specificCompetences: ["Find the distance, midpoint and gradient between two points.", "Write the equation of a straight line."],
    activities: "Learners plot points and lines on graph paper and derive distance, gradient and the equation of a line.",
    notes: {
      intro: "Coordinate geometry uses algebra to study geometric figures placed on the Cartesian plane.",
      sections: [
        {
          heading: "Key formulae",
          points: [
            "Distance = √[(x₂ − x₁)² + (y₂ − y₁)²]",
            "Midpoint = ((x₁ + x₂)/2, (y₁ + y₂)/2)",
            "Gradient m = (y₂ − y₁)/(x₂ − x₁)",
          ],
        },
        {
          heading: "Equation of a line",
          body: "A straight line can be written as y = mx + c, where m is the gradient and c is the y-intercept.",
        },
      ],
    },
  },

  "Form IV|Areas & Perimeters": {
    mainCompetence: "Calculate areas and perimeters of compound figures and apply them to real problems.",
    specificCompetences: ["Find areas of combined plane figures.", "Solve problems involving the area of sectors and arc length."],
    activities: "Learners split compound shapes (e.g. a plot of land) into simple figures and compute the total area.",
    notes: {
      intro: "Compound figures are made by combining simple shapes; their area is found by adding or subtracting the parts.",
      sections: [
        {
          heading: "Sectors and arcs",
          body: "For a sector of angle θ in a circle of radius r: arc length = (θ/360) × 2πr and area = (θ/360) × πr².",
        },
      ],
    },
  },

  "Form IV|Three-Dimensional Figures": {
    mainCompetence: "Calculate surface area and volume of three-dimensional figures.",
    specificCompetences: ["Find the surface area of prisms, cylinders, cones and spheres.", "Calculate the volume of solids."],
    activities: "Learners build or measure solid objects and compute their surface area and volume.",
    notes: {
      intro: "Three-dimensional figures (solids) have length, width and height; they have surface area and volume.",
      sections: [
        {
          heading: "Volume",
          points: ["Prism/cylinder: V = base area × height.", "Cone: V = ⅓πr²h.", "Sphere: V = 4⁄3 πr³."],
        },
      ],
    },
  },

  "Form IV|Probability": {
    mainCompetence: "Use probability to describe the likelihood of events and inform decisions.",
    specificCompetences: ["Calculate the probability of a single event.", "Find the probability of combined events."],
    activities: "Learners conduct experiments with coins and dice, record outcomes and compare experimental with theoretical probability.",
    notes: {
      intro: "Probability measures how likely an event is to happen, on a scale from 0 (impossible) to 1 (certain).",
      sections: [
        {
          heading: "Single events",
          body: "Probability of an event = (number of favourable outcomes) ÷ (total number of possible outcomes).",
        },
        {
          heading: "Combined events",
          body: "For independent events, P(A and B) = P(A) × P(B); for mutually exclusive events, P(A or B) = P(A) + P(B).",
        },
      ],
    },
  },

  "Form IV|Trigonometry": {
    mainCompetence: "Extend trigonometry to angles of any size and to non-right-angled triangles.",
    specificCompetences: ["Use trigonometric ratios for angles greater than 90°.", "Apply the sine and cosine rules."],
    activities: "Learners solve non-right-angled triangle problems (e.g. surveying) using the sine and cosine rules.",
    notes: {
      intro: "Trigonometry extends to all angles and to triangles that are not right-angled.",
      sections: [
        {
          heading: "Sine and cosine rules",
          points: [
            "Sine rule: a/sin A = b/sin B = c/sin C.",
            "Cosine rule: a² = b² + c² − 2bc·cos A.",
          ],
        },
      ],
    },
  },

  "Form IV|Vectors": {
    mainCompetence: "Represent and operate on vectors to solve problems involving displacement and force.",
    specificCompetences: ["Represent vectors and find their magnitude.", "Add and subtract vectors."],
    activities: "Learners represent journeys as vectors on graph paper and find resultant displacements.",
    notes: {
      intro: "A vector is a quantity that has both magnitude (size) and direction, such as displacement, velocity or force.",
      sections: [
        {
          heading: "Vector operations",
          body: "Vectors are added by joining them head to tail; the resultant runs from the start of the first to the end of the last. The magnitude of a vector (x, y) is √(x² + y²).",
        },
      ],
    },
  },

  "Form IV|Matrices & Transformations": {
    mainCompetence: "Use matrices to organise data and to perform transformations.",
    specificCompetences: ["Add, subtract and multiply matrices.", "Use matrices to perform transformations of figures."],
    activities: "Learners arrange data in matrices, operate on them, and apply transformation matrices to shapes.",
    notes: {
      intro: "A matrix is a rectangular array of numbers arranged in rows and columns.",
      sections: [
        {
          heading: "Operations",
          body: "Matrices of the same order are added or subtracted element by element. Multiplication combines rows of the first matrix with columns of the second.",
        },
        {
          heading: "Transformations",
          body: "A 2×2 matrix can transform points on the plane, representing reflections, rotations and enlargements.",
        },
      ],
    },
  },

  "Form IV|Linear Programming": {
    mainCompetence: "Use linear programming to find the best solution under given constraints.",
    specificCompetences: ["Form linear inequalities from word problems.", "Find the optimal value graphically."],
    activities: "Learners model a real resource problem (e.g. maximising profit) with inequalities and solve it graphically.",
    notes: {
      intro: "Linear programming is a method of finding the maximum or minimum value of a quantity subject to linear constraints.",
      sections: [
        {
          heading: "Steps",
          points: [
            "Form inequalities from the constraints.",
            "Draw the inequalities and identify the feasible region.",
            "Test the corner points in the objective function to find the optimum.",
          ],
        },
      ],
    },
  },
};
