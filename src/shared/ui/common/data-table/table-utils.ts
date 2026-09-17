import type { SortingState } from "@tanstack/react-table"

export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 500
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** SortingState to the API sort string, e.g. created,desc. */
export const sortingToApiFormat = (sorting: SortingState): string | undefined => {
  if (sorting.length === 0) return undefined
  const { id, desc } = sorting[0]
  return `${id},${desc ? "desc" : "asc"}`
}

/** The inverse, for restoring sort from the URL. */
export const apiFormatToSorting = (sortString?: string): SortingState => {
  if (!sortString) return []
  const [field, direction] = sortString.split(",")
  if (!field) return []
  return [{ id: field, desc: direction === "desc" }]
}

/**
 * Clamps a page size to a sane positive integer.
 *
 * The entries-per-page control is free-form and the value also arrives from the URL, where anyone
 * can type one; an unbounded size would let a single request ask for the whole table.
 */
export const validatePageSize = (size: number): number => {
  if (!Number.isFinite(size) || size <= 0) return DEFAULT_PAGE_SIZE
  return Math.min(Math.floor(size), MAX_PAGE_SIZE)
}
