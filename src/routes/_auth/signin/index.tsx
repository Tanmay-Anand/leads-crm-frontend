import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import SignInPage from "@/domains/authentication/presentation/pages/sign-in-page"

/** Carries where the user was headed before the guard bounced them here. */
const signInSearchSchema = z.object({
  redirect: z.string().optional()
})

export const Route = createFileRoute("/_auth/signin/")({
  validateSearch: signInSearchSchema,
  component: SignInPage
})
