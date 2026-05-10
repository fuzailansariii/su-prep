import { z } from "zod";

export const adminCreateSectionSchema = z.object({
  setId: z.string().min(1),
  name: z.string().min(1, "Section name is required").max(200),
  order: z.number().int().min(1),
});

export const adminUpdateSectionSchema = adminCreateSectionSchema
  .omit({ setId: true }) // can't move section to another set
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field required",
  );

export type AdminCreateSectionInput = z.infer<typeof adminCreateSectionSchema>;
export type AdminUpdateSectionInput = z.infer<typeof adminUpdateSectionSchema>;
