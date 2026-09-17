import type { LucideIcon } from "lucide-react"

import { cn } from "@/shared/lib/utils"

interface EmptyStateProps {
  Icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 py-16 text-center", className)}>
      {Icon && <Icon className="text-muted-foreground size-8" />}
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="text-muted-foreground max-w-sm text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
