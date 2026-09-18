import { ACTION_REQUIRES } from "../domain/permission.types"

import type { Action, PermissionState, Resource } from "../domain/permission.types"

/**
 * Resource-hierarchy membership test, typed over plain strings rather than `Action`/`Resource` so
 * it can be exercised against a hypothetical resource tree in a unit test without a real backend
 * catalogue, and so it works unchanged once `master-data/*` gets a management screen.
 *
 * A held `"action:parent"` grants `"action:parent/child"` at any depth - an ancestor never implies
 * a *different* action on a descendant, and a descendant never implies its ancestor.
 */
export const grants = (permissions: readonly string[], required: string): boolean => {
  const held = new Set(permissions)
  if (held.has(required)) return true

  const separator = required.lastIndexOf(":")
  if (separator === -1) return false
  const action = required.slice(0, separator)
  const resource = required.slice(separator + 1)

  const segments = resource.split("/")
  for (let depth = segments.length - 1; depth > 0; depth--) {
    if (held.has(`${action}:${segments.slice(0, depth).join("/")}`)) return true
  }
  return false
}

/**
 * The single entry point every gate in the app calls - never `state.permissions` read directly.
 *
 * Exhaustively switched with a `never` default, so a new `PermissionState` variant fails the build
 * instead of silently falling through to "allow", which is how the reference's null-sentinel bug
 * (`getFirstAccessibleRoute` handling `null`, `filterNavByPermission` not, two functions apart)
 * slipped through review.
 */
export const checkPermission = (state: PermissionState, action: Action, resource: Resource | string): boolean => {
  switch (state.status) {
    case "loading":
    case "unauthenticated":
      return false
    case "unrestricted":
      return true
    case "restricted": {
      const required = `${action}:${resource}`
      if (!grants(state.permissions, required)) return false
      const prerequisites = ACTION_REQUIRES[action] ?? []
      return prerequisites.every(prerequisite => grants(state.permissions, `${prerequisite}:${resource}`))
    }
    default: {
      const exhaustive: never = state
      return exhaustive
    }
  }
}
