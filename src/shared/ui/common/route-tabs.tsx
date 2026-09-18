import { Link, useMatchRoute } from "@tanstack/react-router"

import { cn } from "@/shared/lib/utils"

export interface RouteTab {
  label: string
  to: string
}

/**
 * Tab strip backed by real routes, not `?tab=` state.
 *
 * Radix's `Tabs` wants to own `value` itself and fights the router over which tab is active, so
 * this renders plain `<Link>`s styled with `TabsTrigger`'s own classes and lets the router decide.
 * Real routes also mean each tab can carry its own `beforeLoad` guard and search schema - the
 * pattern this component exists to make possible.
 */
export function RouteTabs({ tabs }: { tabs: RouteTab[] }) {
  const matchRoute = useMatchRoute()

  return (
    <div className="border-input/40 text-muted-foreground inline-flex h-auto w-full items-center justify-start gap-0.5 border-b bg-transparent p-0">
      {tabs.map(tab => {
        const isActive = Boolean(matchRoute({ to: tab.to, fuzzy: true }))
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "text-muted-foreground hover:text-foreground focus-visible:outline-ring inline-flex items-center justify-center gap-2 border-b-2 border-transparent bg-transparent px-4 py-2.5 text-sm font-medium tracking-tight whitespace-nowrap transition-colors focus-visible:outline-1",
              isActive && "text-primary border-primary"
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
