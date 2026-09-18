import { createFileRoute, redirect } from "@tanstack/react-router"

import { requireRoutePermission } from "@/domains/authorization/application/route-guards"
import RolesPage from "@/domains/role-management/presentation/pages/roles-page"

export const Route = createFileRoute("/_protected/user-management/roles/")({
  beforeLoad: ({ context }) => {
    if (!requireRoutePermission(context.queryClient, "view", "roles")) {
      throw redirect({ to: "/forbidden" })
    }
  },
  component: RolesPage
})
