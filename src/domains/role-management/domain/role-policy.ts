import type { RoleResponse } from "./types"

export interface PolicyResult {
  allowed: boolean
  reason?: string
}

const ALLOWED: PolicyResult = { allowed: true }

/** Mirrors RoleServiceImpl's own guard exactly: system roles (seeded once, per Cognito group) are
 *  immutable. No client-only rule is added on top - e.g. a role still held by users can be
 *  deleted, because the backend allows it too (a holder falls back to their JWT ceiling). */
export const rolePolicy = {
  canEdit(role: RoleResponse): PolicyResult {
    if (role.isSystem) return { allowed: false, reason: "System roles are immutable." }
    return ALLOWED
  },

  canDelete(role: RoleResponse): PolicyResult {
    if (role.isSystem) return { allowed: false, reason: "System roles are immutable." }
    return ALLOWED
  }
}
