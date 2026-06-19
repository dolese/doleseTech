import { z } from "zod";

/**
 * Schema for an inbound contact / lead submission.
 * Kept deliberately small — name, email, optional company, and a message.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please tell us your name.")
    .max(120, "That name is a little long."),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address.")
    .max(254),
  company: z
    .string()
    .trim()
    .max(160, "That company name is a little long.")
    .optional()
    .or(z.literal("")),
  message: z
    .string()
    .trim()
    .min(10, "A few more words would help us help you.")
    .max(5000, "Please keep it under 5000 characters."),
  // Honeypot field — must stay empty. Bots tend to fill every input.
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactInput = z.infer<typeof contactSchema>;
