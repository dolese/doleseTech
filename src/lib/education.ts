/**
 * Tanzania secondary-education resource catalogue (TIE/NECTA aligned).
 * Drives the /education resource library. Material types follow the standard
 * Tanzanian set: Scheme of Work, Lesson Plans, and Lesson Notes.
 */

export type Level = "O-Level" | "A-Level";

export const MATERIAL_TYPES = ["Scheme of Work", "Lesson Plans", "Lesson Notes"] as const;
export type MaterialType = (typeof MATERIAL_TYPES)[number];

export interface Subject {
  code: string; // short badge label, e.g. "MATH"
  name: string;
  level: Level;
  forms: string; // e.g. "Form I–IV"
  topics: number; // approx. number of syllabus topics covered
  color: string; // subject badge colour
}

const PALETTE = {
  navy: "#16235B",
  green: "#1E9E48",
  teal: "#0E7C86",
  blue: "#2657C7",
  plum: "#6B3FA0",
  rust: "#B5541E",
  pink: "#B83280",
  slate: "#3D5A80",
};

export const SUBJECTS: Subject[] = [
  // ── O-Level (Form I–IV) ───────────────────────────────────────────
  { code: "MATH", name: "Basic Mathematics", level: "O-Level", forms: "Form I–IV", topics: 12, color: PALETTE.navy },
  { code: "ENG", name: "English Language", level: "O-Level", forms: "Form I–IV", topics: 10, color: PALETTE.blue },
  { code: "KIS", name: "Kiswahili", level: "O-Level", forms: "Form I–IV", topics: 11, color: PALETTE.green },
  { code: "BIO", name: "Biology", level: "O-Level", forms: "Form I–IV", topics: 9, color: PALETTE.teal },
  { code: "CHEM", name: "Chemistry", level: "O-Level", forms: "Form I–IV", topics: 10, color: PALETTE.plum },
  { code: "PHY", name: "Physics", level: "O-Level", forms: "Form I–IV", topics: 11, color: PALETTE.rust },
  { code: "GEO", name: "Geography", level: "O-Level", forms: "Form I–IV", topics: 8, color: PALETTE.slate },
  { code: "HIST", name: "History", level: "O-Level", forms: "Form I–IV", topics: 7, color: PALETTE.pink },
  { code: "CIV", name: "Civics", level: "O-Level", forms: "Form I–IV", topics: 6, color: PALETTE.navy },
  { code: "COMM", name: "Commerce", level: "O-Level", forms: "Form III–IV", topics: 8, color: PALETTE.green },
  { code: "B/K", name: "Book-Keeping", level: "O-Level", forms: "Form III–IV", topics: 9, color: PALETTE.teal },
  { code: "ICS", name: "Information & Computer Studies", level: "O-Level", forms: "Form I–IV", topics: 7, color: PALETTE.blue },

  // ── A-Level (Form V–VI) ───────────────────────────────────────────
  { code: "A-MATH", name: "Advanced Mathematics", level: "A-Level", forms: "Form V–VI", topics: 14, color: PALETTE.navy },
  { code: "PHY", name: "Physics", level: "A-Level", forms: "Form V–VI", topics: 12, color: PALETTE.rust },
  { code: "CHEM", name: "Chemistry", level: "A-Level", forms: "Form V–VI", topics: 13, color: PALETTE.plum },
  { code: "BIO", name: "Biology", level: "A-Level", forms: "Form V–VI", topics: 11, color: PALETTE.teal },
  { code: "GEO", name: "Geography", level: "A-Level", forms: "Form V–VI", topics: 9, color: PALETTE.slate },
  { code: "HIST", name: "History", level: "A-Level", forms: "Form V–VI", topics: 8, color: PALETTE.pink },
  { code: "ECON", name: "Economics", level: "A-Level", forms: "Form V–VI", topics: 10, color: PALETTE.blue },
  { code: "KIS", name: "Kiswahili", level: "A-Level", forms: "Form V–VI", topics: 9, color: PALETTE.green },
  { code: "ACC", name: "Accountancy", level: "A-Level", forms: "Form V–VI", topics: 11, color: PALETTE.teal },
  { code: "G/S", name: "General Studies", level: "A-Level", forms: "Form V–VI", topics: 6, color: PALETTE.navy },
];

export const LEVELS: Level[] = ["O-Level", "A-Level"];

/** Common A-Level subject combinations offered in Tanzania. */
export const COMBINATIONS = ["PCM", "PCB", "PGM", "EGM", "HGL", "HGE", "HKL", "ECA", "CBG"];

/** URL slug for a subject, unique across levels, e.g. "o-level-basic-mathematics". */
export function subjectSlug(s: Subject): string {
  const name = s.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${s.level.toLowerCase()}-${name}`;
}

export function getSubjectBySlug(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => subjectSlug(s) === slug);
}

export interface FormTopics {
  form: string;
  topics: string[];
}

/**
 * Syllabus topic outlines by subject slug (TIE/NECTA). Authored for the
 * flagship subjects; subjects without an entry show their materials and forms
 * with a "detailed outline coming soon" note rather than fabricated topics.
 */
export const SUBJECT_TOPICS: Record<string, FormTopics[]> = {
  "o-level-basic-mathematics": [
    { form: "Form I", topics: ["Numbers (Base Ten)", "Fractions, Decimals & Percentage", "Units", "Approximations", "Geometry", "Algebra", "Ratio, Profit & Loss", "Coordinate Geometry", "Perimeters & Areas"] },
    { form: "Form II", topics: ["Exponents & Radicals", "Algebra", "Quadratic Equations", "Logarithms", "Congruence", "Similarity", "Geometrical Transformations", "Pythagoras' Theorem", "Trigonometry", "Sets", "Statistics"] },
    { form: "Form III", topics: ["Relations", "Functions", "Statistics", "Rates & Variations", "Sequences & Series", "Circles", "The Earth as a Sphere", "Accounts"] },
    { form: "Form IV", topics: ["Coordinate Geometry", "Areas & Perimeters", "Three-Dimensional Figures", "Probability", "Trigonometry", "Vectors", "Matrices & Transformations", "Linear Programming"] },
  ],
  "o-level-biology": [
    { form: "Form I", topics: ["Introduction to Biology", "Safety in our Environment (First Aid)", "Health", "Classification of Living Things", "Cell Structure & Organisation", "Movement of Materials in & out of the Cell"] },
    { form: "Form II", topics: ["Classification of Living Things", "Nutrition", "Transport of Materials in Living Things", "Gaseous Exchange & Respiration"] },
    { form: "Form III", topics: ["Regulation (Excretion & Homeostasis)", "Coordination", "Movement", "Reproduction", "Growth"] },
    { form: "Form IV", topics: ["Genetics", "Evolution", "Ecology", "Human Reproductive Health"] },
  ],
  "o-level-chemistry": [
    { form: "Form I", topics: ["Introduction to Chemistry", "Laboratory Techniques & Safety", "Heat Sources & Flames", "Air, Combustion & Rusting", "Water", "Fuels & Energy"] },
    { form: "Form II", topics: ["Matter", "Air & Combustion", "Oxygen & Hydrogen", "Chemical Equations", "Periodic Classification", "Formulae, Names & Equations"] },
    { form: "Form III", topics: ["Atomic Structure", "The Periodic Table", "Electrochemistry", "Volumetric Analysis", "Ionic Theory & Electrolysis", "Hardness of Water"] },
    { form: "Form IV", topics: ["Acids, Bases & Salts", "Salts", "Rate of Reaction & Equilibrium", "Compounds of Metals & Non-metals", "Organic Chemistry", "Pollution"] },
  ],
  "o-level-physics": [
    { form: "Form I", topics: ["Introduction to Physics", "Measurement", "Force", "Archimedes' Principle & Flotation", "Structure & Properties of Matter", "Pressure", "Work, Energy & Power", "Light"] },
    { form: "Form II", topics: ["Static Electricity", "Current Electricity", "Magnetism", "Forces in Equilibrium", "Simple Machines", "Motion", "Temperature", "Sustainable Energy"] },
    { form: "Form III", topics: ["Application of Vectors", "Friction", "Light (Reflection & Refraction)", "Optical Instruments", "Thermal Expansion", "Transfer of Thermal Energy", "Current Electricity"] },
    { form: "Form IV", topics: ["Waves", "Electromagnetism", "Radioactivity", "Electronics", "Elementary Astronomy", "Nuclear Physics"] },
  ],
  "o-level-english-language": [
    { form: "Form I", topics: ["Listening & Speaking", "Reading Skills", "Grammar: Tenses & Articles", "Vocabulary", "Writing: Paragraphs & Letters"] },
    { form: "Form II", topics: ["Comprehension", "Summary Writing", "Active & Passive, Reported Speech", "Composition", "Literature Appreciation"] },
    { form: "Form III", topics: ["Advanced Comprehension", "Note-making", "Conditionals & Phrasal Verbs", "Functional Writing", "Oral Literature"] },
    { form: "Form IV", topics: ["Synthesis & Summary", "Essay Writing", "Grammar Revision", "Literature: Novels, Plays & Poetry", "Examination Techniques"] },
  ],
  "o-level-kiswahili": [
    { form: "Form I", topics: ["Sauti na Silabi", "Matumizi ya Lugha", "Ufahamu", "Ufupisho", "Utungaji", "Fasihi kwa Ujumla"] },
    { form: "Form II", topics: ["Ngeli za Nomino", "Vitenzi", "Uakifishaji", "Ushairi", "Riwaya", "Tamthiliya"] },
    { form: "Form III", topics: ["Tahajia", "Methali na Misemo", "Semi", "Uchambuzi wa Fasihi", "Insha za Kiuamilifu"] },
    { form: "Form IV", topics: ["Sarufi Maumbo", "Tafsiri na Ukalimani", "Fasihi Simulizi", "Fasihi Andishi", "Mbinu za Mtihani"] },
  ],
  "o-level-geography": [
    { form: "Form I", topics: ["Concept of Geography", "The Earth & the Solar System", "Major Features of the Earth's Surface", "Weather & Climate", "Map Work"] },
    { form: "Form II", topics: ["Statistics & Mapping", "Settlement", "Soil", "Agriculture", "Sustainable Use of Resources"] },
    { form: "Form III", topics: ["Application of Statistics", "Photograph Interpretation", "Study of Soils", "Manufacturing Industries", "Transport & Communication"] },
    { form: "Form IV", topics: ["Regional Focal Studies", "Environmental Management", "Population & Development", "Research Techniques"] },
  ],
  "o-level-history": [
    { form: "Form I", topics: ["Sources & Importance of History", "Evolution of Man", "Development of Economic Activities", "Social & Political Organisations"] },
    { form: "Form II", topics: ["Contacts between Africa & the Wider World", "Social, Economic & Political Systems", "Rise of Nations & States", "Trade"] },
    { form: "Form III", topics: ["Africa in the 19th Century", "Establishment of Colonialism", "Colonial Economy", "Colonial Administration", "Reaction to Colonialism"] },
    { form: "Form IV", topics: ["Nationalism & Decolonisation", "Africa since Independence", "Liberation Struggles", "International Cooperation"] },
  ],
  "o-level-civics": [
    { form: "Form I", topics: ["Life Skills", "The Family", "Personal & Environmental Hygiene", "Promotion of Life Skills"] },
    { form: "Form II", topics: ["Culture", "Money & Banking", "Work", "Gender"] },
    { form: "Form III", topics: ["The Government of Tanzania", "Democracy", "Human Rights", "The Constitution"] },
    { form: "Form IV", topics: ["National Ethics & Integrity", "Globalisation", "International Relations & Cooperation", "Civil Society"] },
  ],
  "a-level-advanced-mathematics": [
    { form: "Form V", topics: ["Calculating Devices", "Functions", "Algebra", "Logarithms", "Trigonometry", "Differentiation", "Integration", "Statistics", "Probability"] },
    { form: "Form VI", topics: ["Sets", "Numerical Methods", "Coordinate Geometry I & II", "Differential Equations", "Complex Numbers", "Vectors", "Linear Programming", "Matrices"] },
  ],
  "a-level-physics": [
    { form: "Form V", topics: ["Measurement", "Mechanics (Dynamics)", "Properties of Matter", "Fluid Dynamics", "Vibrations & Waves", "Thermal Physics", "Geometric Optics", "Current Electricity"] },
    { form: "Form VI", topics: ["Electrostatics", "Capacitors", "Electromagnetism", "Electronics", "Atomic Physics", "Nuclear Physics", "Astrophysics", "Environmental Physics"] },
  ],
  "a-level-economics": [
    { form: "Form V", topics: ["Basic Economic Concepts", "Theory of Demand & Supply", "Consumer Behaviour", "Theory of Production", "Costs & Revenue", "Market Structures"] },
    { form: "Form VI", topics: ["National Income", "Money & Banking", "Public Finance", "International Trade", "Economic Development & Planning", "Population & Labour"] },
  ],
};
