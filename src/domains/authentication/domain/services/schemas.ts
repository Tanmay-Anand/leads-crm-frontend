import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().trim().min(1, { message: "Email is required" }).pipe(
    z.email({ message: "Enter a valid email address" })
  ),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
})

export type SignInFormValues = z.infer<typeof signInSchema>

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Use at least 8 characters" })
      .regex(/[A-Z]/, { message: "Include an uppercase letter" })
      .regex(/[a-z]/, { message: "Include a lowercase letter" })
      .regex(/[0-9]/, { message: "Include a number" }),
    confirmPassword: z.string()
  })
  .refine(values => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>
