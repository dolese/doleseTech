/**
 * What teachers say about the Exams Composer, shown on /exams.
 *
 * Only real words from real teachers, with their permission to show their
 * name and school. The section stays hidden while this list is empty — a
 * product page with invented reviews is worse than one with none.
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** e.g. "Biology teacher, Mwangaza Secondary School" */
  role: string;
}

export const TESTIMONIALS: Testimonial[] = [];
