import type { AuthState, SignInData, SignInOutcome } from "@/domains/authentication/domain/types"
import type { Result } from "@/shared/types/result"

export interface AuthContextType {
  /** True while the initial session check is in flight, before any route can decide anything. */
  loading: boolean
  authenticated: boolean
  state?: AuthState
  signIn: (data: SignInData) => Promise<Result<SignInOutcome, string>>
  confirmNewPassword: (newPassword: string) => Promise<Result<SignInOutcome, string>>
  signOut: () => Promise<void>
  refetch: () => Promise<void>
}
