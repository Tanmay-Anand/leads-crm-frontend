import { useState, type CSSProperties } from "react"

import { Outlet } from "@tanstack/react-router"

import { layoutConfig } from "./layout.config"
import { NavbarHeader } from "./navbar"
import Sidebar from "./sidebar"

export function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const sidebarWidth = isCollapsed ? layoutConfig.sidebarWidth.collapsed : layoutConfig.sidebarWidth.expanded
  const layoutStyle = { "--sidebar-width": sidebarWidth } as CSSProperties

  return (
    <div className="bg-background text-foreground flex" style={layoutStyle}>
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />

      <div className="bg-sidebar flex h-screen min-w-0 flex-1 flex-col transition-all duration-300">
        <NavbarHeader className="h-12" />

        {/* Own scroll container, so a sticky toolbar inside a page sticks to the page rather than
            to the viewport. */}
        <div className="bg-background relative min-h-0 flex-1 overflow-y-auto rounded-tl-lg">
          <main className="h-full w-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
