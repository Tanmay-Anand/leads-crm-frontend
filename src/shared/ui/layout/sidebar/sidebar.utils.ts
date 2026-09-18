import { checkPermission } from "@/domains/authorization/application/permission-policy"
import type { PermissionState } from "@/domains/authorization/domain/permission.types"

import type { SidebarItem } from "./sidebar.config"

/** Nav items the signed-in user can actually reach, in declaration order. */
export const filterNavByPermission = (items: SidebarItem[], state: PermissionState): SidebarItem[] =>
  items.filter(item => checkPermission(state, "view", item.resource))

/**
 * The first route this user has view access to, or `/forbidden` if none - what `/` and any other
 * blanket redirect should land on instead of a hard-coded `/leads`, which bounces a user without
 * `view:leads` straight into a 403.
 */
export const getFirstAccessibleRoute = (items: SidebarItem[], state: PermissionState): string => {
  const first = items.find(item => checkPermission(state, "view", item.resource))
  return first?.to ?? "/forbidden"
}
