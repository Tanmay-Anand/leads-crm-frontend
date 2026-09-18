import type { UserRole } from "@/domains/authentication/domain/types"

import type { UserDto } from "./types"

export interface PolicyResult {
  allowed: boolean
  reason?: string
}

const ALLOWED: PolicyResult = { allowed: true }

export const isAdminRole = (role: UserRole): boolean => role === "TENANT_ADMIN" || role === "PLATFORM_ADMIN"
export const isPlatformRole = (role: UserRole): boolean => role === "PLATFORM_ADMIN" || role === "PLATFORM_USER"

/**
 * Client-side mirror of `UserServiceImpl`'s business guards, for disabling a row action with a
 * tooltip explaining why. The backend re-enforces every one of these regardless of what this
 * module says (Phase 10's convention, and the port's own manual-verification step #9), so drift
 * here only ever costs a confusing 403, never a security hole.
 *
 * Returns `{ allowed, reason }` rather than a boolean because the table needs the reason for its
 * tooltip - in the reference that string is an inline ternary inside the column definition, which
 * is exactly why rule and explanation drift apart there.
 */
export const userPolicy = {
  canChangeRole(target: UserDto, currentUserId: string): PolicyResult {
    if (target.id === currentUserId) return { allowed: false, reason: "You cannot change your own role." }
    return ALLOWED
  },

  canChangeStatus(target: UserDto, currentUserId: string): PolicyResult {
    if (target.id === currentUserId) return { allowed: false, reason: "You cannot change your own status." }
    if (isAdminRole(target.role)) return { allowed: false, reason: "An admin's status cannot be changed." }
    return ALLOWED
  },

  canDelete(target: UserDto, currentUserId: string): PolicyResult {
    if (target.id === currentUserId) return { allowed: false, reason: "You cannot delete yourself." }
    return ALLOWED
  },

  canAssignRole(role: UserRole, callerIsPlatformAdmin: boolean): PolicyResult {
    if (isPlatformRole(role) && !callerIsPlatformAdmin) {
      return { allowed: false, reason: "Only a platform admin may assign a platform role." }
    }
    return ALLOWED
  }
}
