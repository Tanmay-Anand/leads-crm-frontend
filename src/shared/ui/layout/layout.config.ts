/**
 * Shared layout configuration, in its own file to avoid a circular import between the layout and
 * the protected route that renders it.
 */
export const layoutConfig = {
  sidebarWidth: {
    collapsed: "4rem" as const,
    expanded: "12rem" as const
  }
}
