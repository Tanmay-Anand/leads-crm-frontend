/** Spring Data page envelope, as the backend returns it. */
export interface Paginated<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

/** One field, value and type triple posted to a /search endpoint. */
export interface SearchFilter {
  field: string
  query: string
  type: string
}

/** Value and label pair behind a filter dropdown. */
export interface FilterOption {
  value: string
  label: string
}
