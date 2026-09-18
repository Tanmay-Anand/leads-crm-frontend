import type { ReactNode } from "react"

import { checkPermission } from "@/domains/authorization/application/permission-policy"
import type { Action, Resource } from "@/domains/authorization/domain/permission.types"
import { usePermissionState } from "@/domains/authorization/presentation/hooks/use-authorization-queries"


interface RequirePermissionProps {
  action: Action
  resource: Resource | string
  children: ReactNode
  /** Rendered instead of nothing when the permission is absent. Rarely needed - most call sites
   *  just want the affordance to disappear. */
  fallback?: ReactNode
}

/**
 * Hides `children` when the signed-in user lacks `action:resource`.
 *
 * Built on `useQuery` (via `usePermissionState`), so it is reactive - the reference reads its
 * permission cache bare, so nothing re-renders once `/me` resolves and a restricted user briefly
 * sees the full UI on a hard reload.
 */
export function RequirePermission({ action, resource, children, fallback = null }: RequirePermissionProps) {
  const state = usePermissionState()
  return checkPermission(state, action, resource) ? <>{children}</> : <>{fallback}</>
}

/**
 * The imperative counterpart, for disabling a row action rather than hiding a whole subtree.
 * Phase 10's convention: `<RequirePermission>` hides a create affordance; `hasPermission` disables
 * a row action - hiding row actions makes menus jump between rows.
 */
export function usePermission() {
  const state = usePermissionState()
  return {
    state,
    hasPermission: (action: Action, resource: Resource | string) => checkPermission(state, action, resource)
  }
}
