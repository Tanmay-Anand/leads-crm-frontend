import { useNavigate } from "@tanstack/react-router"
import { LogOut, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { useAuth } from "@/app/providers/auth-provider"
import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"

export function NavbarHeader({ className }: { className?: string }) {
  const { state, signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()

  const user = state?.user
  const initials = (user?.email ?? user?.username ?? "?").slice(0, 1).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    await navigate({ to: "/signin" })
  }

  return (
    <header className={cn("flex h-12 items-center justify-end gap-2 px-4", className)}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-medium">
              {initials}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal">
            <span className="block text-sm font-medium">{user?.username ?? "Signed in"}</span>
            {user?.email && <span className="text-muted-foreground block truncate text-xs">{user.email}</span>}
            {user?.role && <span className="text-muted-foreground block text-xs">{user.role}</span>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
