import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

import { PAGE_SIZE_OPTIONS } from "./table-utils"

import type { DataTablePaginationProps } from "./data-table.types"

export function DataTablePagination<TData>({ table, totalElements, className }: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const pageCount = table.getPageCount()

  // Derived from the server total rather than the loaded rows, because the table only ever holds
  // one page at a time.
  const total = totalElements ?? table.getRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, total)

  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 py-3", className)}>
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <span>Rows per page</span>
        <Select value={String(pageSize)} onValueChange={value => table.setPageSize(Number(value))}>
          <SelectTrigger className="h-8 w-[4.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PAGE_SIZE_OPTIONS.map(option => (
              <SelectItem key={option} value={String(option)}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="text-muted-foreground text-sm">
        {from}-{to} of {total}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="First page"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-2 text-sm">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Last page"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
