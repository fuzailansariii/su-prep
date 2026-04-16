import { z } from "zod";

export const Difficulty = z.enum(["easy", "medium", "hard"]);
export const TestStatus = z.enum(["draft", "published", "archived"]);

const LIMITS = {
  title: { min: 3, max: 200 },
  description: { max: 1000 },
  questions: { min: 1, max: 500 },
  duration: { min: 1, max: 600 },
  price: { max: 1_000_000 }, // max ₹10,000 in paise
};

// Shared base — never used directly, only extended
const adminTestBaseSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(LIMITS.title.min, "Title must be at least 3 characters")
    .max(LIMITS.title.max, "Title is too long"),

  description: z.string().max(LIMITS.description.max).nullable().optional(),

  thumbnail: z.string().url("Must be a valid URL").nullable().optional(),

  duration: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Duration is required"
          : "Duration must be a number",
    })
    .int("Duration must be a whole number")
    .min(LIMITS.duration.min, "Duration must be at least 1 minute")
    .max(LIMITS.duration.max, "Duration cannot exceed 600 minutes"),

  totalQuestions: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Total Question is required"
          : "Must be a number",
    })
    .int()
    .min(LIMITS.questions.min, "Must have at least 1 question")
    .max(LIMITS.questions.max, "Cannot exceed 500 questions"),

  totalMarks: z
    .number({ error: "Must be a number" })
    .int()
    .min(1, "Total marks must be at least 1"),

  price: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Pricee is requird"
          : "Price must be a number",
    })
    .int("Price must be in paise — no decimals")
    .min(0, "Price cannot be negative")
    .max(LIMITS.price.max, "Price is too high"),

  difficulty: Difficulty.default("medium"),

  isFeatured: z.boolean().default(false),

  negativeMarking: z.boolean().default(false),

  negativeMarkFraction: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Negative Marks is required"
          : "Must be a number",
    })
    .int("Must be a whole number")
    .min(0)
    .max(100)
    .default(25),
});

// Create — no id (generated server-side), no status (always "draft" on create)
export const adminCreateTestSchema = adminTestBaseSchema;
export type AdminCreateInput = z.infer<typeof adminCreateTestSchema>;

// Update — all fields optional, at least one required
export const adminUpdateTestSchema = adminTestBaseSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );
export type AdminUpdateInput = z.infer<typeof adminUpdateTestSchema>;

// Status update — separate, only accepts valid transitions
export const updateStatusSchema = z.object({
  status: TestStatus,
});
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

// Featured toggle
export const updateFeaturedSchema = z.object({
  isFeatured: z.boolean({
    error: (issue) =>
      issue.input === undefined
        ? "isFeatured is required"
        : "isFeatured must be true or false",
  }),
});
export type UpdateFeaturedInput = z.infer<typeof updateFeaturedSchema>;
