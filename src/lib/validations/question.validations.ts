import { z } from "zod";

export const QuestionType = z.enum(["mcq", "multi", "truefalse"]);

export const optionSchema = z.object({
  id: z.string().optional(), // Used to track existing options if updating
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1),
});

// ── Validation rules per question type ──
const optionsRefinement = (
  options: z.infer<typeof optionSchema>[],
  ctx: z.RefinementCtx,
  type: string,
) => {
  const correctCount = options.filter((o) => o.isCorrect).length;
  if (type === "mcq" && correctCount !== 1) {
    ctx.addIssue({
      code: "custom",
      message: "MCQ must have exactly 1 correct answer",
      path: ["options"],
    });
  }
  if (type === "multi" && correctCount < 2) {
    ctx.addIssue({
      code: "custom",
      message: "Multi-correct must have at least 2 correct answers",
      path: ["options"],
    });
  }
  if (type === "truefalse" && options.length !== 2) {
    ctx.addIssue({
      code: "custom",
      message: "True/False must have exactly 2 options",
      path: ["options"],
    });
  }
};

export const adminCreateQuestionSchema = z
  .object({
    setId: z.string().min(1),
    sectionId: z.string().nullable().optional(),
    questionText: z
      .string()
      .min(3, "Question must be at least 3 characters")
      .max(2000),
    type: QuestionType.default("mcq"),
    explanation: z.string().max(2000).nullable().optional(),
    marks: z.number().int().min(1).default(1),
    order: z.number().int().min(1),
    options: z.array(optionSchema).min(2, "At least 2 options required"),
  })
  .superRefine((data, ctx) => optionsRefinement(data.options, ctx, data.type));

export const adminUpdateQuestionSchema = z
  .object({
    questionText: z.string().min(3).max(2000).optional(),
    type: QuestionType.optional(),
    explanation: z.string().max(2000).nullable().optional(),
    marks: z.number().int().min(1).optional(),
    order: z.number().int().min(1).optional(),
    sectionId: z.string().nullable().optional(),
    options: z.array(optionSchema).min(2).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.options && data.type) {
      optionsRefinement(data.options, ctx, data.type);
    }
  });

// TYPES
export type AdminCreateQuestionInput = z.infer<
  typeof adminCreateQuestionSchema
>;
export type AdminUpdateQuestionInput = z.infer<
  typeof adminUpdateQuestionSchema
>;
