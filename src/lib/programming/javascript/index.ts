import { attachPractice } from "../types";
import { beginner } from "./beginner";
import { intermediate } from "./intermediate";
import { advanced } from "./advanced";
import { practice } from "./practice";

export const levels = attachPractice({ beginner, intermediate, advanced }, practice);
