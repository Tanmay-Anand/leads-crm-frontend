import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import type { RouterContext } from "@/app/providers/router-provider"
import { RouteErrorFallback } from "@/shared/ui/common/route-error-fallback"
import { Toaster } from "@/shared/ui/sonner"

/**
 * Root layout.
 *
 * Providers live above the router in main.tsx, so this holds only what has to sit inside routing:
 * the outlet and the toaster.
 */
function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  )
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RouteErrorFallback
})
