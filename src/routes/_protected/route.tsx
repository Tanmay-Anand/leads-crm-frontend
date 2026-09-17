import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAuthStateQueryOptions } from "@/domains/authentication/presentation/hooks/use-authentication-queries"
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
  },
  component: MainLayout,
  errorComponent: RouteErrorFallback
})
