import { Building2, Handshake, UserCog, Users } from "lucide-react"

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
 * pre-sales and post-sales, and four items do not need a grouping to be findable.
 */
export const sidebarItems: SidebarItem[] = [
  { label: "Leads", to: "/leads", icon: Users, resource: "leads" },
  { label: "Projects", to: "/projects", icon: Building2, resource: "projects" },
  { label: "Channel Partners", to: "/channel-partners", icon: Handshake, resource: "channel-partners" },
  { label: "User Management", to: "/user-management/users", icon: UserCog, resource: "users" }
]
