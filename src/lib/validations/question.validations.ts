import { z } from "zod";

export const QuestionType = z.enum(["mcq", "multi", "truefalse"]);

export const optionSchema = z.object({
  id: z.string().optional(), // Used to track existing options if updating
  optionText: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().default(false),
  order: z.number().int().min(1),
});

/**
 * Schema for updating a single question.
 * Used in PATCH /api/admin/tests/[id]/questions/[qid]
 */
export const adminUpdateQuestionSchema = z.object({
  questionText: z.string().min(3, "Question must be at least 3 characters").optional(),
  type: QuestionType.optional(),
  explanation: z.string().nullable().optional(),
  marks: z.number().int().min(1).optional(),
  order: z.number().int().min(0).optional(),
  section: z.string().nullable().optional(),
  options: z.array(optionSchema).min(1, "At least one option is required").optional(),
});

export type AdminUpdateQuestionInput = z.infer<typeof adminUpdateQuestionSchema>;

/**
 * Schema for creating a single question (if needed)
 */
export const adminCreateQuestionSchema = z.object({
  questionText: z.string().min(3, "Question must be at least 3 characters"),
  type: QuestionType.default("mcq"),
  explanation: z.string().nullable().optional(),
  marks: z.number().int().min(1).default(1),
  order: z.number().int().min(0),
  section: z.string().nullable().optional(),
  options: z.array(optionSchema).min(1, "At least one option is required"),
});

export type AdminCreateQuestionInput = z.infer<typeof adminCreateQuestionSchema>;
