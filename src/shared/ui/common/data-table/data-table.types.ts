import type {
  Column,
  ColumnDef,
  SortingState,
  Table,
  VisibilityState
} from "@tanstack/react-table"

export type { Column, ColumnDef, SortingState, Table, VisibilityState }

/** Pagination state, in the shape TanStack Table expects. */
export interface PaginationState {
  pageIndex: number
  pageSize: number
}

/** One selectable scope in the toolbar search dropdown. */
export interface SearchFilter {
  id: string
  displayName: string
}

export interface DataTableConfig {
  title?: string
  showSearch?: boolean
  showFilter?: boolean
  showColumnVisibility?: boolean
  showPagination?: boolean
  showToolbar?: boolean
  addButton?: {
    label: string
    onClick: () => void
  }
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  config?: DataTableConfig
  globalFilter: string
  onGlobalFilterChange: (value: string, searchFields?: string) => void
  /** Column ids that cannot be hidden. */
  lockedColumns?: string[]
  /** Rendered inside the filter drawer. */
  filterContent?: React.ReactNode
  /** Rendered beside the filter button, for Reset and similar. */
  filterActions?: React.ReactNode
  onFilterSearch?: () => void
  onFilterReset?: () => void
  /** Scopes offered in the search dropdown. Omit for an unscoped search. */
  availableSearchFilters?: SearchFilter[]
  /** True when a filter is currently narrowing the list, so the button can show it. */
  hasActiveFilters?: boolean
  className?: string
}

export interface DataTablePaginationProps<TData> {
  table: Table<TData>
  totalElements?: number
  className?: string
}

export interface DataTableViewProps<TData> {
  table: Table<TData>
  isLoading?: boolean
  onRowClick?: (row: TData) => void
  getRowClassName?: (row: TData) => string
  classNames?: {
    row?: string
    header?: string
  }
}
