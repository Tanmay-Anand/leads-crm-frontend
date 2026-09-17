import * as React from "react"

import { cn } from "@/shared/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
const CELL_WIDTH_LIMIT = 400
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn("text-foreground w-full table-fixed caption-bottom text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("bg-muted text-muted-foreground border-input/40 [&_tr]:border-input/40 [&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr]:border-input/40 [&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-input/40 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "data-[state=selected]:bg-primary/5 hover:bg-primary/5 border-input/40 border-b transition-colors",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground text-2xs h-auto px-3.5 py-2.5 text-left align-middle font-semibold tracking-[0.04em] whitespace-nowrap uppercase [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

interface TableCellProps extends React.ComponentProps<"td"> {
  /**
   * Opt out of the overflow tooltip. Set this for cells that render rich content
   * (stacked lines, pills, icons) rather than a single long string: the tooltip
   * re-renders the cell's own markup on a dark surface, so `text-foreground`
   * text comes out near-invisible and pills duplicate confusingly.
   */
  disableOverflowTooltip?: boolean
}

function TableCell({ className, children, disableOverflowTooltip = false, ...props }: TableCellProps) {
  const contentRef = React.useRef<HTMLSpanElement>(null)
  const [isTruncated, setIsTruncated] = React.useState(false)

  React.useEffect(() => {
    if (disableOverflowTooltip) return
    const el = contentRef.current
    if (!el) return

    const ghost = document.createElement("span")
    ghost.style.cssText = `
      position: fixed;
      visibility: hidden;
      white-space: nowrap;
      font-size: 0.875rem;
      padding: 0 14px;
      pointer-events: none;
    `
    ghost.textContent = el.textContent ?? ""
    document.body.appendChild(ghost)
    const naturalWidth = ghost.getBoundingClientRect().width
    document.body.removeChild(ghost)

    setIsTruncated(naturalWidth > CELL_WIDTH_LIMIT)
  }, [children, disableOverflowTooltip])

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "text-foreground px-3.5 py-2.5 text-left align-middle text-sm whitespace-nowrap overflow-hidden [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      style={!disableOverflowTooltip ? { maxWidth: CELL_WIDTH_LIMIT } : undefined}
      {...props}
    >
      {isTruncated ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span ref={contentRef} className="block w-full cursor-default truncate">
              {children}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" style={{ maxWidth: CELL_WIDTH_LIMIT }} className="break-words">
            {children}
          </TooltipContent>
        </Tooltip>
      ) : (
        <span ref={contentRef} className="block">
          {children}
        </span>
      )}
    </td>
  )
}
function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption data-slot="table-caption" className={cn("text-muted-foreground text-2xs mt-4", className)} {...props} />
  )
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption }
