import type React from "react"

import { useQueryClient } from "@tanstack/react-query"

import { toAuthErrorMessage } from "@/domains/authentication/application/auth-errors"
import type { SignInData, SignInOutcome } from "@/domains/authentication/domain/types"
import {
  confirmNewPassword as confirmNewPasswordProvider,
  signIn as signInProvider,
  signOut as signOutProvider
} from "@/domains/authentication/infrastructure/amplify-auth.provider"
import {
  getAuthStateQueryOptions,
  useAuthState
} from "@/domains/authentication/presentation/hooks/use-authentication-queries"
import { clearTokenCache } from "@/infrastructure/http/api.client"
import { tenantSession } from "@/infrastructure/session/tenant-session.adapter"
import { err, ok, type Result } from "@/shared/types/result"

import { AuthContext } from "./auth-context"

/**
 * Owns the session: the auth-state query, sign-in, sign-out, and the tenant the API client sends.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const { data, isLoading } = useAuthState()

  /**
   * Re-reads the session and republishes the tenant.
   *
   * staleTime is overridden to zero because every caller here has just changed the session, so the
   * cached answer is known to be wrong.
   */
  const refetchState = async () => {
    const state = await queryClient.fetchQuery({ ...getAuthStateQueryOptions(), staleTime: 0 })

    // The tenant travels as a header on every request, so it has to be resolved once at sign-in
    // rather than read from the token per call.
    if (state?.user?.tenantId) {
      tenantSession.setTenantId(state.user.tenantId)
    } else {
      tenantSession.clearTenantId()
    }

    return state
  }

  const signIn = async (data: SignInData): Promise<Result<SignInOutcome, string>> => {
    try {
      const outcome = await signInProvider(data)

      // A challenge means there is no session yet, so there is nothing to bootstrap: the caller
      // routes the user to the next step instead.
      if (outcome.type !== "signedIn") {
        return ok(outcome)
      }

      await refetchState()
      return ok(outcome)
    } catch (error) {
      return err(toAuthErrorMessage(error))
    }
  }

  const confirmNewPassword = async (newPassword: string): Promise<Result<SignInOutcome, string>> => {
    try {
      const outcome = await confirmNewPasswordProvider(newPassword)
      if (outcome.type === "signedIn") {
        await refetchState()
      }
      return ok(outcome)
    } catch (error) {
      return err(toAuthErrorMessage(error))
    }
  }

  const signOut = async () => {
    try {
      await signOutProvider()
    } finally {
      // Runs even when the Cognito call fails: leaving a cached token behind after the user asked
      // to sign out is worse than a provider error they can do nothing about.
      clearTokenCache()
      tenantSession.clearTenantId()
      queryClient.clear()
      await queryClient.fetchQuery({ ...getAuthStateQueryOptions(), staleTime: 0 })
    }
  }

  return (
    <AuthContext.Provider
      value={{
        loading: isLoading,
        authenticated: data?.authenticated ?? false,
        state: data,
        signIn,
        confirmNewPassword,
        signOut,
        refetch: async () => {
          await refetchState()
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
