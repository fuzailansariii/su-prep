import z from "zod";

export const startAttemptSchema = z.object({
  setId: z.string().min(1),
});
