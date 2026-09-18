import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { requireRoutePermission } from "@/domains/authorization/application/route-guards"
import { RouteTabs } from "@/shared/ui/common/route-tabs"

const TABS = [
  { label: "Users", to: "/user-management/users" },
  { label: "Roles & Permissions", to: "/user-management/roles" }
]

/**
 * Two routes under one layout, not `?tab=`: the tabs need different guards (`view:users` vs
 * `view:roles`) and different search schemas, and with `?tab=` the guard would have to move inside
 * the component - the pattern this port exists to remove. This layout only checks that at least
 * one tab is reachable; each leaf route (`users/route.tsx`, `roles/route.tsx`) re-checks its own.
 */
export const Route = createFileRoute("/_protected/user-management")({
  beforeLoad: ({ context }) => {
    const canViewUsers = requireRoutePermission(context.queryClient, "view", "users")
    const canViewRoles = requireRoutePermission(context.queryClient, "view", "roles")
    if (!canViewUsers && !canViewRoles) {
      throw redirect({ to: "/forbidden" })
    }
  },
  component: UserManagementLayout
})

function UserManagementLayout() {
  return (
    <div className="flex h-full flex-col">
      <div className="px-6 pt-4">
        <RouteTabs tabs={TABS} />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  )
}
