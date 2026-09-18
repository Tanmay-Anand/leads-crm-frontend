import { createFileRoute, redirect } from "@tanstack/react-router"

import { getAuthStateQueryOptions } from "@/domains/authentication/presentation/hooks/use-authentication-queries"
import { toPermissionState } from "@/domains/authorization/application/permission-state"
import { getMeQueryOptions } from "@/domains/authorization/presentation/hooks/use-authorization-queries"
import { sidebarItems } from "@/shared/ui/layout/sidebar/sidebar.config"
import { getFirstAccessibleRoute } from "@/shared/ui/layout/sidebar/sidebar.utils"

/**
 * Leads is the home of this CRM for anyone who can see it; otherwise this sends the user to the
 * first screen they actually have view access to, rather than hard-redirecting into a 403.
 *
 * This route sits above `/_protected`, so it repeats that layout's auth + /me resolution rather
 * than depending on it - both calls share the same query cache entries, so nothing is fetched
 * twice over the network.
 */
export const Route = createFileRoute("/")({
  beforeLoad: async ({ context, location }) => {
    const auth = await context.queryClient.fetchQuery(getAuthStateQueryOptions())
    if (!auth?.authenticated) {
      throw redirect({ to: "/signin", search: { redirect: location.href } })
    }

    const me = await context.queryClient.ensureQueryData(getMeQueryOptions())
    throw redirect({ to: getFirstAccessibleRoute(sidebarItems, toPermissionState(me, false)) })
  }
})
