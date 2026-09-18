import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAuthStateQueryOptions } from "@/domains/authentication/presentation/hooks/use-authentication-queries"
import { getMeQueryOptions } from "@/domains/authorization/presentation/hooks/use-authorization-queries"
import { RouteErrorFallback } from "@/shared/ui/common/route-error-fallback"
import { MainLayout } from "@/shared/ui/layout/main-layout"

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context, location }) => {
    // fetchQuery rather than the hook: the guard has to have an answer before anything renders,
    // and this shares the cache entry the provider already populated.
    const auth = await context.queryClient.fetchQuery(getAuthStateQueryOptions())

    if (!auth?.authenticated) {
      throw redirect({
        to: "/signin",
        search: { redirect: location.href }
      })
    }

    // Sequential, not parallel: /me needs the bearer token and x-tenant-id the auth check above
    // just resolved. Populates the cache every downstream permission gate (reactive or the
    // synchronous route-guard read) relies on, before any child route renders.
    //
    // A failed /me (expired token, a backend blip, ...) must not crash the whole app into the
    // generic error boundary - the reference never made a network call on this path at all, so
    // this is a real regression risk if left uncaught. Treat any failure the same as "not signed
    // in": the api client has already cleared the token and redirected on a 401, and any other
    // failure is safest handled the same way rather than stranding the user on an error screen.
    try {
      await context.queryClient.ensureQueryData(getMeQueryOptions())
    } catch {
      throw redirect({ to: "/signin", search: { redirect: location.href } })
    }
  },
  component: MainLayout,
  errorComponent: RouteErrorFallback
})
