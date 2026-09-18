import { createListFilterStore, type BaseListFilters } from "@/shared/lib/store/create-list-filter-store"

/**
 * A small, purpose-built panel (status/role/custom-role) instead of the shared advanced-filter
 * drawer - that drawer needs backend `filter-fields` + `advanced-search` endpoints this domain
 * does not have, and reusing it would pull in `FilterGroup` from the leads domain, whose groups
 * are all lead-specific. See the porting spec's "Skip in v1" note.
 */
export interface UsersFilters extends BaseListFilters {
  enabled?: boolean
  role?: string
  customRoleId?: string
}

const defaultFilters: UsersFilters = {
  search: "",
  searchFields: "",
  fromDate: undefined,
  toDate: undefined,
  dateType: "created",
  enabled: undefined,
  role: undefined,
  customRoleId: undefined
}

export const useUsersFilterStore = createListFilterStore<UsersFilters>(defaultFilters)
