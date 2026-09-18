import type { UserRole } from "@/domains/authentication/domain/types"

/**
 * Read model and the edit request body (`PUT /users/{id}` takes this same shape back). No
 * password field, ever - see `user-form-dialog.tsx`'s class doc for why editing can never rotate
 * a colleague's password through this form.
 */
export interface UserDto {
  id: string
  tenantId: string
  email: string
  firstName?: string | null
  lastName?: string | null
  displayName: string
  role: UserRole
  customRoleId?: string | null
  enabled: boolean
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  lastModifiedBy?: string | null
  isActive?: boolean | null
}

/** POST /users body only - carries a password, since Cognito provisioning needs one up front. */
export interface UserRequest {
  email: string
  firstName?: string | null
  lastName?: string | null
  password: string
  role: UserRole
  customRoleId?: string | null
}

export interface UserNamesDto {
  id: string
  displayName: string
}

export type UserSearchField = "EMAIL" | "FIRST_NAME" | "LAST_NAME"
