import {
  adminCreateTestSchema,
  adminUpdateTestSchema,
} from "./test.validations";
import { z } from "zod";

// It takes your backend schema and overrides ONLY the fields
export const adminCreateTestFormSchema = adminCreateTestSchema.extend({
  duration: z.coerce
    .number({ error: "Duration must be a number" })
    .int("Must be a whole number")
    .min(1, "At least 1 minute")
    .max(600, "Max 600 minutes"),

  totalQuestions: z.coerce
    .number({ error: "Must be a number" })
    .int()
    .min(1)
    .max(500),

  totalMarks: z.coerce.number({ error: "Must be a number" }).int().min(1),

  price: z.coerce
    .number({ error: "Price must be a number" })
    .int("Must be in paise")
    .min(0)
    .max(1_000_000),

  negativeMarkFraction: z.coerce.number().int().min(0).max(100).default(25),
});

export const adminUpdateTestFormSchema = adminUpdateTestSchema.extend({
  duration: z.coerce.number().int().min(1).max(600).optional(),
  totalQuestions: z.coerce.number().int().min(1).max(500).optional(),
  totalMarks: z.coerce.number().int().min(1).optional(),
  price: z.coerce.number().int().min(0).max(1_000_000).optional(),
  negativeMarkFraction: z.coerce.number().int().min(0).max(100).optional(),
});

// Frontend types
export type AdminCreateFormInput = z.infer<typeof adminCreateTestFormSchema>;
export type AdminUpdateFormInput = z.infer<typeof adminUpdateTestFormSchema>;
