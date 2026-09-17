import { Building2, Handshake, Users } from "lucide-react"

import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
  label: string
  to: string
  icon: LucideIcon
}

/**
 * The navigation.
 *
 * Flat rather than grouped: the reference groups because it has twenty-odd destinations across
 * pre-sales and post-sales, and three items do not need a grouping to be findable.
 */
export const sidebarItems: SidebarItem[] = [
  { label: "Leads", to: "/leads", icon: Users },
  { label: "Projects", to: "/projects", icon: Building2 },
  { label: "Channel Partners", to: "/channel-partners", icon: Handshake }
]
