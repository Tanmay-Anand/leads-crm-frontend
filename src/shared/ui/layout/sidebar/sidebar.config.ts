import { Building2, UserCog, Users } from "lucide-react"

import type { Resource } from "@/domains/authorization/domain/permission.types"

import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
  label: string
  to: string
  icon: LucideIcon
  /** Gates both nav visibility and being offered as a redirect target - view access to this
   *  resource is what "can this user reach this screen at all" means. */
  resource: Resource
}

/**
 * The navigation.
 *
 * Flat rather than grouped: the reference groups because it has twenty-odd destinations across
 * pre-sales and post-sales, and three items do not need a grouping to be findable.
 *
 * No "Channel Partners" entry - that module tracks external broker/agency partners referring
 * leads to a developer, which does not apply when the tenant itself is the broker/channel
 * partner. The route and underlying feature still exist (see routes/_protected/channel-partners),
 * just unreachable from the nav.
 */
export const sidebarItems: SidebarItem[] = [
  { label: "Leads", to: "/leads", icon: Users, resource: "leads" },
  { label: "Projects", to: "/projects", icon: Building2, resource: "projects" },
  { label: "User Management", to: "/user-management/users", icon: UserCog, resource: "users" }
]
