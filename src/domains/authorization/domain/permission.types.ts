/** Actions the backend's CrmPermission catalogue enforces, across every resource. */
export type Action = "view" | "view_assigned" | "add" | "update" | "delete" | "assign" | "toggle"

/**
 * Resources this frontend has a typed literal for. The permission matrix (Phase 9) renders
 * arbitrary strings straight off `GET /permissions/catalog` instead - including `master-data/*`,
 * which has no management screen here yet - so `Permission` below is intentionally untyped.
 */
export type Resource = "leads" | "projects" | "channel-partners" | "users" | "roles"

/** `action:resource`, e.g. `"view:leads"`. */
export type Permission = string

export const permissionSet = (permissions: readonly Permission[]): ReadonlySet<Permission> => new Set(permissions)

/**
 * Every action beyond `view` requires `view` on the same resource too - a role holding
 * `update:leads` but not `view:leads` has nothing to open to reach the edit button.
 */
export const ACTION_REQUIRES: Partial<Record<Action, Action[]>> = {
  add: ["view"],
  update: ["view"],
  delete: ["view"],
  assign: ["view"],
  toggle: ["view"]
}

/**
 * Replaces the reference's `permissions === null` sentinel for "unrestricted". There, `null` also
 * means "not loaded yet" wherever `/me` has not resolved, so a restricted user sees the whole UI
 * for one frame on a hard reload. Every state here is explicit and `loading` always denies.
 */
export type PermissionState =
  | { status: "loading" }
  | { status: "unauthenticated" }
  | { status: "unrestricted" }
  | { status: "restricted"; permissions: readonly Permission[] }
