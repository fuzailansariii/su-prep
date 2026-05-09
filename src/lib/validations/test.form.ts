import {
  adminCreateTestSchema,
  adminUpdateTestSchema,
} from "./test.validations";
import { z } from "zod";

// It takes your backend schema and overrides ONLY the fields
export const adminCreateTestFormSchema = adminCreateTestSchema.extend({
  price: z.coerce
    .number({ error: "Price must be a number" })
    .int("Must be in paise")
    .min(0)
    .max(1_000_000),
});

export const adminUpdateTestFormSchema = adminUpdateTestSchema.extend({
  price: z.coerce.number().int().min(0).max(1_000_000).optional(),
});

// Frontend types
export type AdminCreateFormInput = z.infer<typeof adminCreateTestFormSchema>;
export type AdminUpdateFormInput = z.infer<typeof adminUpdateTestFormSchema>;
