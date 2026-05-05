import z from "zod";

/* =========================================================
   SIGNUP & LOGIN SCHEMA
========================================================= */
export const signInSchema = z.object({
  email: z.email("Please enter a valid email address"),
});

export const signUpSchema = z.object({
  email: z.email("Please enter a valid email address"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(1, "Last name is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
