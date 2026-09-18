import { Link } from "@tanstack/react-router"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { usePermissionState } from "@/domains/authorization/presentation/hooks/use-authorization-queries"
import { cn } from "@/shared/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui/tooltip"

import { sidebarItems } from "./sidebar.config"
import { filterNavByPermission } from "./sidebar.utils"

interface SidebarProps {
  isCollapsed: boolean
  onToggle?: () => void
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const permissionState = usePermissionState()
  const visibleItems = filterNavByPermission(sidebarItems, permissionState)

  return (
    <aside
      className={cn(
        "bg-sidebar text-sidebar-foreground flex h-screen shrink-0 flex-col border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-48"
      )}
    >
      <div className="flex h-12 items-center gap-2 px-4">
        <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded text-xs font-semibold">
          L
        </div>
        {!isCollapsed && <span className="truncate text-sm font-semibold">Leads CRM</span>}
      </div>

      <nav className="flex-1 space-y-1 px-2 py-2">
        <TooltipProvider delayDuration={0}>
          {visibleItems.map(item => {
            const link = (
              <Link
                key={item.to}
                to={item.to}
                // activeProps rather than a pathname comparison, so a detail route under /leads
                // still lights up its parent entry.
                activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                activeOptions={{ exact: false }}
                className={cn(
                  "hover:bg-sidebar-accent/60 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                  isCollapsed && "justify-center"
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </Link>
            )

            if (!isCollapsed) return link

            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="hover:bg-sidebar-accent/60 text-muted-foreground flex items-center gap-2.5 px-4 py-3 text-sm transition-colors"
      >
        {isCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        {!isCollapsed && <span>Collapse</span>}
      </button>
    </aside>
  )
}
