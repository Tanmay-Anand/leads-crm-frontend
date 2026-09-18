import { getCoreRowModel, useReactTable } from "@tanstack/react-table"

import { cn } from "@/shared/lib/utils"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTableView } from "./data-table-view"

import type {
  ColumnDef,
  DataTableConfig,
  PaginationState,
  SearchFilter,
  SortingState,
  VisibilityState
} from "./data-table.types"

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[]
  data: TData[]
  getRowId?: (row: TData) => string
  config?: DataTableConfig
  className?: string
  isLoading?: boolean

  // Server-side pagination
  pageCount?: number
  totalElements?: number
  pagination: PaginationState
  onPaginationChange: (updater: (prev: PaginationState) => PaginationState) => void

  // Server-side sorting
  sorting: SortingState
  onSortingChange: (updater: SortingState | ((prev: SortingState) => SortingState)) => void

  // Server-side search
  globalFilter: string
  onGlobalFilterChange: (value: string, searchFields?: string) => void
  availableSearchFilters?: SearchFilter[]

  // Column visibility
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void
  lockedColumns?: string[]

  // Filter drawer
  filterContent?: React.ReactNode
  filterActions?: React.ReactNode
  hasActiveFilters?: boolean
  onFilterSearch?: () => void
  onFilterReset?: () => void

  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string
  getRowDataAttributes?: (row: TData) => Record<string, string>
}

/**
 * Shared list table: toolbar, body and pagination over one TanStack Table instance.
 *
 * Every mode is manual, because paging, sorting and searching all happen on the server. The table
 * holds one page at a time, so letting it sort or filter client-side would reorder that page in
 * isolation and disagree with what the next page returns.
 */
export function DataTable<TData>({
  columns,
  data,
  getRowId,
  config,
  className,
  isLoading,
  pageCount,
  totalElements,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  availableSearchFilters,
  columnVisibility,
  onColumnVisibilityChange,
  lockedColumns,
  filterContent,
  filterActions,
  hasActiveFilters,
  onFilterSearch,
  onFilterReset,
  onRowClick,
  getRowClassName,
  getRowDataAttributes
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: getRowId ? row => getRowId(row) : undefined,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: pageCount ?? -1,
    state: {
      pagination,
      sorting,
      columnVisibility: columnVisibility ?? {}
    },
    onPaginationChange: updater => {
      onPaginationChange(prev => (typeof updater === "function" ? updater(prev) : updater))
    },
    onSortingChange: updater => {
      onSortingChange(prev => (typeof updater === "function" ? updater(prev) : updater))
    },
    onColumnVisibilityChange: updater => {
      onColumnVisibilityChange?.(prev => (typeof updater === "function" ? updater(prev) : updater))
    }
  })

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {config?.showToolbar !== false && (
        <DataTableToolbar
          table={table}
          config={config}
          globalFilter={globalFilter}
          onGlobalFilterChange={onGlobalFilterChange}
          lockedColumns={lockedColumns}
          filterContent={filterContent}
          filterActions={filterActions}
          hasActiveFilters={hasActiveFilters}
          onFilterSearch={onFilterSearch}
          onFilterReset={onFilterReset}
          availableSearchFilters={availableSearchFilters}
        />
      )}

      <DataTableView
        table={table}
        isLoading={isLoading}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
        getRowDataAttributes={getRowDataAttributes}
      />

      {config?.showPagination !== false && (
        <DataTablePagination table={table} totalElements={totalElements} />
      )}
    </div>
  )
}

export { DataTablePagination } from "./data-table-pagination"
export { DataTableToolbar } from "./data-table-toolbar"
export { DataTableView } from "./data-table-view"
export * from "./data-table.types"
export * from "./table-utils"
