import { queryOptions, useQuery } from "@tanstack/react-query"

import { toPermissionState } from "../../application/permission-state"
import { authorizationService } from "../../infrastructure/api/authorization.service"

import { authorizationKeys } from "./authorization.keys"

/**
 * Shared definition of the /me read.
 *
 * Exported as options, not only a hook, because `_protected/route.tsx`'s `beforeLoad` resolves it
 * with `ensureQueryData` before anything renders, and both paths must hit the same cache entry -
 * the same reason `getAuthStateQueryOptions` is shared for the Cognito session.
 */
export const getMeQueryOptions = () =>
  queryOptions({
    queryKey: authorizationKeys.me(),
    queryFn: authorizationService.getMe,
    staleTime: 5 * 60 * 1_000,
    retry: false
  })

export const useMe = () => useQuery(getMeQueryOptions())

/** The reactive read every component-level gate should use - never the bare cache. */
export const usePermissionState = () => {
  const { data, isLoading } = useMe()
  return toPermissionState(data, isLoading)
}
