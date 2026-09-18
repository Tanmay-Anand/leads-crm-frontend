import type { UserRole } from "@/domains/authentication/domain/types"
import { api } from "@/infrastructure/http/api.client"


/**
 * GET /users/me. `permissions` is always a real array and `unrestricted` is an explicit boolean -
 * see MeResponse.java's class doc for why the `null = full access` sentinel is kept off the wire.
 */
export interface MeResponse {
  id: string
  tenantId: string | null
  email: string | null
  displayName: string | null
  role: UserRole | null
  unrestricted: boolean
  permissions: string[]
}

const usersApi = api.getService("users")

export const authorizationService = {
  getMe: (): Promise<MeResponse> => usersApi.get("/me")
}
