import { create } from "zustand"

import type { SortingState, VisibilityState } from "@tanstack/react-table"

import { DEFAULT_PAGE_SIZE } from "@/shared/ui/common/data-table/table-utils"

/** Filter state every list screen has, whatever else it adds on top. */
export interface BaseListFilters {
  search: string
  searchFields: string
  fromDate?: string
  toDate?: string
  dateType?: string
  columnVisibility?: VisibilityState
}

export interface ListFilterState<TFilters extends BaseListFilters> {
  filters: TFilters
  defaultFilters: TFilters
  pagination: { pageIndex: number; pageSize: number }
  sorting: SortingState
  setFilters: (patch: Partial<TFilters>) => void
  setPagination: (updater: (prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number }) => void
  setSorting: (updater: SortingState | ((prev: SortingState) => SortingState)) => void
  resetFilters: () => void
}

/**
 * Builds a Zustand store for one list screen.
 *
 * The reference keeps a hand-written store per domain, which is three copies of the same reducer
 * once the modules are this similar. Behaviour worth keeping is centralised here: changing any
 * filter returns to the first page, because leaving the user on page 4 of a result set that now
 * has one page shows an empty table that looks like a bug.
 */
export function createListFilterStore<TFilters extends BaseListFilters>(
  defaultFilters: TFilters,
  defaultSorting: SortingState = [{ id: "created", desc: true }]
) {
  return create<ListFilterState<TFilters>>(set => ({
    filters: defaultFilters,
    defaultFilters,
    pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
    sorting: defaultSorting,

    setFilters: patch =>
      set(state => {
        // Column visibility is a view preference, not a filter, so toggling a column must not
        // throw the user back to page one mid-scan.
        const onlyVisibilityChanged = Object.keys(patch).every(key => key === "columnVisibility")

        return {
          filters: { ...state.filters, ...patch },
          pagination: onlyVisibilityChanged ? state.pagination : { ...state.pagination, pageIndex: 0 }
        }
      }),

    setPagination: updater => set(state => ({ pagination: updater(state.pagination) })),

    setSorting: updater =>
      set(state => ({
        sorting: typeof updater === "function" ? updater(state.sorting) : updater,
        pagination: { ...state.pagination, pageIndex: 0 }
      })),

    resetFilters: () =>
      set(state => ({
        // Column visibility survives a reset: it is what the user chose to look at, not what they
        // were filtering by.
        filters: { ...defaultFilters, columnVisibility: state.filters.columnVisibility },
        pagination: { ...state.pagination, pageIndex: 0 }
      }))
  }))
}
