import { authorizationKeys } from "../presentation/hooks/authorization.keys"

import { toPermissionState } from "./permission-state"

import type { PermissionState } from "../domain/permission.types"
import type { MeResponse } from "../infrastructure/api/authorization.service"
import type { QueryClient } from "@tanstack/react-query"

/**
 * Synchronous, non-reactive read of the permission state from the query cache.
 *
 * For route guards only (`beforeLoad` runs outside React and cannot use a hook). Every other
 * consumer must use `usePermissionState`/`RequirePermission`/`usePermission`, which are reactive -
 * reading the cache bare in a component is exactly the reference's bug, where nothing re-rendered
 * once `/me` resolved. `eslint.config.js`'s `no-restricted-imports` rule enforces that boundary.
 *
 * Missing cache data reads as `loading` (deny) rather than `unauthenticated`: by the time a nested
 * route's guard runs, `_protected/route.tsx` has already awaited the query, so an empty cache here
 * means something is wrong, not that the user is signed out - denying is the safer default.
 */
export const getPermissionStateFromCache = (queryClient: QueryClient): PermissionState => {
  const me = queryClient.getQueryData<MeResponse>(authorizationKeys.me())
  return me ? toPermissionState(me, false) : { status: "loading" }
}
