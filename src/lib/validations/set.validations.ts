import { z } from "zod";
import { TestStatus } from "./test.validations";

export const adminCreateSetSchema = z.object({
  testId: z.string().min(1),
  title: z.string().min(1, "Set title is required").max(200),
  description: z.string().max(1000).nullable().optional(),
  duration: z.number().int().min(1, "At least 1 minute").max(600),
  totalQuestions: z.number().int().min(1),
  totalMarks: z.number().int().min(1),
  negativeMarking: z.boolean().default(false),
  negativeMarkFraction: z.number().int().min(0).max(100).default(25),
  order: z.number().int().min(1),
  status: TestStatus.default("draft"),
});

export const adminUpdateSetSchema = adminCreateSetSchema
  .omit({ testId: true }) // can't move a set to another test
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field required",
  );

// Form schema (coerce for HTML inputs)
export const adminCreateSetFormSchema = adminCreateSetSchema.extend({
  duration: z.coerce.number().int().min(1).max(600),
  totalQuestions: z.coerce.number().int().min(1),
  totalMarks: z.coerce.number().int().min(1),
  negativeMarkFraction: z.coerce.number().int().min(0).max(100).default(25),
  order: z.coerce.number().int().min(1),
});

export type AdminCreateSetInput = z.infer<typeof adminCreateSetSchema>;
export type AdminUpdateSetInput = z.infer<typeof adminUpdateSetSchema>;
export type AdminCreateSetFormInput = z.infer<typeof adminCreateSetFormSchema>;
