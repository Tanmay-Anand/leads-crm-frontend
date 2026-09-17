export interface SignInData {
  email: string
  password: string
}

/** Roles the API recognises, as Cognito group names. */
export type UserRole = "PLATFORM_ADMIN" | "PLATFORM_USER" | "TENANT_ADMIN" | "TENANT_USER"

export interface AuthUser {
  /** Cognito sub, which the API reads as the acting user id. */
  userId: string
  username: string
  email?: string
  role?: UserRole
  /** custom:tenantId. Absent for a platform user, who selects a tenant instead. */
  tenantId?: string
}

export interface AuthState {
  authenticated: boolean
  user?: AuthUser
}

/** Sign-in can succeed, or stop on a Cognito challenge that needs another screen. */
export type SignInOutcome =
  | { type: "signedIn" }
  | { type: "newPasswordRequired" }
  | { type: "resetRequired" }
