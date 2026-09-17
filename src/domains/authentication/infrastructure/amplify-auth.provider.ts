import {
  confirmSignIn,
  fetchAuthSession,
  getCurrentUser,
  signIn as amplifySignIn,
  signOut as amplifySignOut
} from "aws-amplify/auth"

import type { AuthState, AuthUser, SignInData, SignInOutcome, UserRole } from "../domain/types"

/**
 * The only place that talks to Amplify.
 *
 * Everything above this file deals in the domain types, so swapping the identity provider would be
 * a change to this file rather than to every screen.
 */

const ROLES: UserRole[] = ["PLATFORM_ADMIN", "PLATFORM_USER", "TENANT_ADMIN", "TENANT_USER"]

/**
 * Reads the current session and maps the ID token claims onto an AuthUser.
 *
 * Claims rather than a profile endpoint: the API derives the tenant and the role from exactly
 * these claims, so reading anything else here would let the UI and the API disagree about who the
 * user is.
 */
export const getAuthState = async (): Promise<AuthState> => {
  try {
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken
    if (!idToken) {
      return { authenticated: false }
    }

    const payload = idToken.payload
    const groups = (payload["cognito:groups"] as string[] | undefined) ?? []
    const role = ROLES.find(candidate => groups.includes(candidate))

    const user: AuthUser = {
      userId: String(payload.sub ?? ""),
      username: String(payload["cognito:username"] ?? payload.sub ?? ""),
      email: payload.email ? String(payload.email) : undefined,
      role,
      tenantId: payload["custom:tenantId"] ? String(payload["custom:tenantId"]) : undefined
    }

    return { authenticated: true, user }
  } catch {
    // No session at all throws rather than returning empty, and that is the normal state of a
    // signed-out visitor, so it is not an error worth logging.
    return { authenticated: false }
  }
}

export const signIn = async (data: SignInData): Promise<SignInOutcome> => {
  // Amplify refuses a fresh sign-in while a session is still open, which happens whenever a user
  // lands on /signin with a stale session. Clearing first makes the form behave the same either way.
  try {
    await getCurrentUser()
    await amplifySignOut()
  } catch {
    // No current user, which is the expected case.
  }

  const result = await amplifySignIn({ username: data.email, password: data.password })

  if (result.isSignedIn) {
    return { type: "signedIn" }
  }

  switch (result.nextStep?.signInStep) {
    case "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED":
      return { type: "newPasswordRequired" }
    case "RESET_PASSWORD":
      return { type: "resetRequired" }
    default:
      return { type: "signedIn" }
  }
}

/** Completes the first-login challenge, where Cognito holds the session until a password is set. */
export const confirmNewPassword = async (newPassword: string): Promise<SignInOutcome> => {
  const result = await confirmSignIn({ challengeResponse: newPassword })
  return result.isSignedIn ? { type: "signedIn" } : { type: "newPasswordRequired" }
}

export const signOut = async (): Promise<void> => {
  await amplifySignOut()
}
