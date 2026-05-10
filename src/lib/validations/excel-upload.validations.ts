import z from "zod";

export const excelQuestionRowSchema = z.object({
  order: z.coerce.number().int().min(1),
  questionText: z.string().min(1, "Question is required"),
  type: z.enum(["mcq", "multi", "truefalse"]).default("mcq"),
  marks: z.coerce.number().int().min(1).default(1),
  sectionName: z.string().optional(),
  explanation: z.string().nullable().optional(),
  optionA: z.string().min(1, "Option A is required"),
  optionB: z.string().min(1, "Option B is required"),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correct: z.string().min(1, "Correct answer required"), // "A" or "A,C"
});

export const excelUploadSchema = z
  .array(excelQuestionRowSchema)
  .min(1, "File has no questions")
  .max(500, "Cannot upload more than 500 questions at once");

export type ExcelQuestionRow = z.infer<typeof excelQuestionRowSchema>;
