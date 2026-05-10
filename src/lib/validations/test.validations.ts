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
  thumbnail: z.url("Must be a valid URL").nullable().optional(),
  price: z
    .number({
      error: (issue) =>
        issue.input === undefined
          ? "Price is required"
          : "Price must be a number",
    })
    .int("Price must be in paise — no decimals")
    .min(0, "Price cannot be negative")
    .max(LIMITS.price.max, "Price is too high"),
  originalPrice: z
    .number({ error: "Must be a number" })
    .int()
    .min(0)
    .max(LIMITS.price.max)
    .nullable()
    .optional(),
  difficulty: Difficulty.default("medium"),
  isFeatured: z.boolean().default(false),
});

// Create — no id (generated server-side), no status (always "draft" on create)
export const adminCreateTestSchema = adminTestBaseSchema;
export type AdminCreateInput = z.infer<typeof adminCreateTestSchema>;

// Update — all fields optional, at least one required
export const adminUpdateTestSchema = adminTestBaseSchema
  .extend({
    status: TestStatus,
  })
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
