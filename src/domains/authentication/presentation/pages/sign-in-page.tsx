import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useForm } from "react-hook-form"

import { useAuth } from "@/app/providers/auth-provider"
import { env } from "@/infrastructure/config/env"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"

import {
  newPasswordSchema,
  signInSchema,
  type NewPasswordFormValues,
  type SignInFormValues
} from "../../domain/services/schemas"

export default function SignInPage() {
  const { signIn, confirmNewPassword } = useAuth()
  const navigate = useNavigate()
  const search = useSearch({ from: "/_auth/signin/" })

  // Cognito can stop sign-in on a first-login challenge, at which point there is no session yet
  // and the user has to set a password before anything else can happen.
  const [challenge, setChallenge] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" }
  })

  const passwordForm = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" }
  })

  const goToApp = async () => {
    // The guard puts the intended destination in the URL, so an expired session returns the user
    // where they were rather than dumping them on the list.
    await navigate({ to: search.redirect ?? "/leads" })
  }

  const onSignIn = async (values: SignInFormValues) => {
    setError(null)
    const result = await signIn(values)

    if (!result.success) {
      setError(result.error)
      return
    }

    if (result.data.type === "newPasswordRequired") {
      setChallenge(true)
      return
    }

    if (result.data.type === "resetRequired") {
      setError("Your password must be reset. Ask an administrator to issue a new temporary password.")
      return
    }

    await goToApp()
  }

  const onSetPassword = async (values: NewPasswordFormValues) => {
    setError(null)
    const result = await confirmNewPassword(values.password)

    if (!result.success) {
      setError(result.error)
      return
    }

    if (result.data.type === "signedIn") {
      await goToApp()
      return
    }

    // The challenge session expired, so the user has to start again with their credentials.
    setChallenge(false)
    setError("That took too long. Sign in again to continue.")
  }

  return (
    <div className="from-success-100/15 via-background to-primary/10 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <div className="border-input/40 bg-card grid w-full max-w-4xl overflow-hidden rounded-3xl border shadow-lg md:grid-cols-2">
        {/* Form panel */}
        <div className="flex flex-col justify-center px-8 py-10 sm:px-12">
          <div className="mb-10 flex items-center gap-2.5">
            <div className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
              L
            </div>
            <span className="font-sans text-base font-bold tracking-tight">Leads CRM</span>
          </div>

          <h1 className="font-sans text-[26px] font-bold tracking-tight text-balance">
            {challenge ? "Set a new password" : "Welcome back"}
          </h1>
          <p className="text-muted-foreground mt-2 mb-8 text-sm">
            {challenge
              ? "Your account needs a permanent password before you can continue."
              : "Sign in with your organisation account to continue."}
          </p>

          {!env.isAuthConfigured && (
            <p
              role="alert"
              className="mb-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
              Cognito is not configured. Set VITE_AWS_COGNITO_USER_POOL_ID and
              VITE_AWS_COGNITO_USER_POOL_CLIENT_ID in .env, then restart the dev server.
            </p>
          )}

          {error && (
            <p role="alert" className="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm">
              {error}
            </p>
          )}

          {challenge ? (
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onSetPassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                          className="h-11 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="new-password"
                          className="h-11 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SubmitButton isSubmitting={passwordForm.formState.isSubmitting} idleLabel="Set password and continue" busyLabel="Saving..." />
              </form>
            </Form>
          ) : (
            <Form {...signInForm}>
              <form onSubmit={signInForm.handleSubmit(onSignIn)} className="space-y-4">
                <FormField
                  control={signInForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          autoComplete="username"
                          placeholder="you@company.com"
                          className="h-11 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={signInForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                          className="h-11 rounded-xl"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SubmitButton isSubmitting={signInForm.formState.isSubmitting} idleLabel="Sign in" busyLabel="Signing in..." />
              </form>
            </Form>
          )}
        </div>

        {/* Illustration panel */}
        <div className="from-primary to-success-100 relative hidden overflow-hidden bg-gradient-to-br p-10 md:flex md:flex-col md:justify-start">
          <BuildingsIllustration />
          {/* Scrim so the copy stays legible regardless of how faint the watermark towers are up here. */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/25 to-transparent" />
          <div className="relative z-10">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-white">Every lead, one pipeline.</h2>
            <p className="mt-2 max-w-[26ch] text-sm text-white/85">
              Track, assign and close deals without leaving the CRM.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SubmitButton({
  isSubmitting,
  idleLabel,
  busyLabel
}: {
  isSubmitting: boolean
  idleLabel: string
  busyLabel: string
}) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn(
        "from-primary to-success-100 h-11 w-full rounded-xl bg-gradient-to-r text-sm font-semibold shadow-md",
        "hover:opacity-95"
      )}
    >
      {isSubmitting ? busyLabel : idleLabel}
    </Button>
  )
}

/** A quiet skyline, not a literal brand asset - the shared visual language (an oversized, very
 *  faint watermark shape behind a smaller, more solid foreground group) without depending on a
 *  real illustration file. */
function BuildingsIllustration() {
  return (
    <svg
      viewBox="0 0 400 460"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
    >
      {/* oversized, faint watermark towers */}
      <rect x="130" y="100" width="90" height="380" rx="14" fill="white" fillOpacity="0.07" />
      <rect x="230" y="150" width="110" height="330" rx="14" fill="white" fillOpacity="0.05" />

      {/* skyline, hugging the bottom edge so the heading above always has clear room */}
      <rect x="10" y="350" width="42" height="110" rx="4" fill="white" fillOpacity="0.5" />
      <rect x="60" y="310" width="48" height="150" rx="4" fill="white" fillOpacity="0.65" />
      <rect x="116" y="260" width="54" height="200" rx="4" fill="white" fillOpacity="0.9" />
      <rect x="178" y="290" width="46" height="170" rx="4" fill="white" fillOpacity="0.75" />
      <rect x="232" y="330" width="40" height="130" rx="4" fill="white" fillOpacity="0.55" />
      <rect x="280" y="285" width="52" height="175" rx="4" fill="white" fillOpacity="0.8" />
      <rect x="340" y="340" width="38" height="120" rx="4" fill="white" fillOpacity="0.45" />

      {/* windows on the two tallest buildings */}
      {[0, 1, 2, 3, 4].map(row =>
        [0, 1].map(col => (
          <rect
            key={`tower-${row}-${col}`}
            x={124 + col * 20}
            y={272 + row * 32}
            width="10"
            height="14"
            rx="2"
            fill="#0d3d33"
            fillOpacity="0.25"
          />
        ))
      )}
      {[0, 1, 2, 3].map(row =>
        [0, 1].map(col => (
          <rect
            key={`tower2-${row}-${col}`}
            x={288 + col * 20}
            y={297 + row * 32}
            width="10"
            height="14"
            rx="2"
            fill="#0d3d33"
            fillOpacity="0.25"
          />
        ))
      )}
    </svg>
  )
}
