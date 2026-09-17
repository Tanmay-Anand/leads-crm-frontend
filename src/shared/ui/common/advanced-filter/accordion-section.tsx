import { useState } from "react"

import { ChevronDown } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"

interface AccordionProps {
  title: string
  badge?: number
  defaultOpen?: boolean
  children: React.ReactNode
}

/**
 * One collapsible section of the filter drawer.
 *
 * Local rather than the Radix accordion, because the drawer needs several sections open at once
 * and each one remembers its own state.
 */
export function Accordion({ title, badge, defaultOpen = false, children }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-md border">
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        aria-expanded={open}
        className="hover:bg-muted/50 flex w-full items-center justify-between gap-2 px-3 py-2 text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {badge !== undefined && <Badge variant="secondary">{badge}</Badge>}
        </span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="border-t px-3 pb-3">{children}</div>}
    </div>
  )
}
