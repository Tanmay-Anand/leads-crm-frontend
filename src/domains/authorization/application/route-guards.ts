import { getPermissionStateFromCache } from "./permission-cache"
import { checkPermission } from "./permission-policy"

import type { Action, Resource } from "../domain/permission.types"
import type { QueryClient } from "@tanstack/react-query"

/**
 * Synchronous route guard for `beforeLoad`.
 *
 * A fix, not a port: the reference's equivalent is `permissions.some(async p => ...)`, and an
 * async callback passed to `Array.some` always returns a truthy Promise, so the guard never
 * denies anything. This is a plain synchronous check instead.
 */
export const requireRoutePermission = (
  queryClient: QueryClient,
  action: Action,
  resource: Resource | string
): boolean => checkPermission(getPermissionStateFromCache(queryClient), action, resource)
