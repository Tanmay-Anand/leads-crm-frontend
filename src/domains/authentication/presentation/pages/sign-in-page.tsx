import { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useForm } from "react-hook-form"

import { useAuth } from "@/app/providers/auth-provider"
import { env } from "@/infrastructure/config/env"
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card"
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
    <div className="bg-muted/30 flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{challenge ? "Set a new password" : "Sign in"}</CardTitle>
          <CardDescription>
            {challenge
              ? "Your account needs a permanent password before you can continue."
              : "Leads CRM. Use your organisation account."}
          </CardDescription>
        </CardHeader>

        <CardContent>
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
            <p
              role="alert"
              className="bg-destructive/10 text-destructive mb-4 rounded-md px-3 py-2 text-sm"
            >
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
                        <Input {...field} type="password" autoComplete="new-password" />
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
                        <Input {...field} type="password" autoComplete="new-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting ? "Saving..." : "Set password and continue"}
                </Button>
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
                        <Input {...field} type="email" autoComplete="username" placeholder="you@company.com" />
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
                        <Input {...field} type="password" autoComplete="current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={signInForm.formState.isSubmitting}>
                  {signInForm.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
