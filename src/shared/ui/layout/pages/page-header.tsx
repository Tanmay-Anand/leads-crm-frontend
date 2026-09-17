import { cn } from "@/shared/lib/utils"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export interface PageHeaderProps {
  Icon?: LucideIcon
  title: ReactNode
  left?: ReactNode
  subtitle?: ReactNode
  cta?: ReactNode
  className?: string
  classNames?: {
    title?: string
    titleContainer?: string
    subtitle?: string
    ctaContainer?: string
  }
}

export default function PageHeader({ Icon, title, left, subtitle, cta, className, classNames }: PageHeaderProps) {
  return (
    <section className={cn("flex flex-col items-center gap-4 sm:flex-row", className)}>
      {left}
      <div className={classNames?.titleContainer}>
        <h1 className={cn("text-foreground flex items-center gap-2 text-3xl font-semibold", classNames?.title)}>
          {Icon && <Icon className="text-primary h-6 w-6" />}
          {title}
        </h1>
        {subtitle && <p className={cn("text-muted-foreground mt-1", classNames?.subtitle)}>{subtitle}</p>}
      </div>
      <div className={cn("ml-auto", classNames?.ctaContainer)}>{cta}</div>
    </section>
  )
}
