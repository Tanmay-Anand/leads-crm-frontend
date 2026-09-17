import { queryOptions, useQuery } from "@tanstack/react-query"

import { getAuthState } from "../../infrastructure/amplify-auth.provider"

import { authenticationKeys } from "./authentication.keys"

/**
 * Shared definition of the auth-state read.
 *
 * Exported as options rather than only as a hook because the protected route guard resolves it
 * with queryClient.fetchQuery before rendering, and both paths must hit the same cache entry.
 */
export const getAuthStateQueryOptions = () =>
  queryOptions({
    queryKey: authenticationKeys.state(),
    queryFn: getAuthState,
    // Long enough that navigation does not re-check Cognito on every route change; sign-in and
    // sign-out both refetch explicitly, so this never leaves a stale session on screen.
    staleTime: 5 * 60 * 1_000,
    retry: false
  })

export const useAuthState = () => useQuery(getAuthStateQueryOptions())
