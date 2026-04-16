import z from "zod";

export const startAttemptSchema = z.object({
  testId: z.string().min(1),
});
