
import { cn } from "@/shared/lib/utils"
import { Skeleton } from "@/shared/ui/skeleton"

import type { LucideIcon } from "lucide-react"

export interface KpiCardProps {
  label: string
  value: number | string
  Icon?: LucideIcon
  isLoading?: boolean
  className?: string
}

export function KpiCard({ label, value, Icon, isLoading, className }: KpiCardProps) {
  return (
    <div className={cn("bg-card flex items-center gap-3 rounded-md border p-3", className)}>
      {Icon && (
        <span className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
          <Icon className="size-4" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-muted-foreground truncate text-xs">{label}</p>
        {isLoading ? <Skeleton loading className="mt-1 h-5 w-10" /> : <p className="text-lg font-semibold">{value}</p>}
      </div>
    </div>
  )
}

export function KpiSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>{children}</div>
}
