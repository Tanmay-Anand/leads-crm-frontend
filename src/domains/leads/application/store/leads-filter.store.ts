import { createListFilterStore, type BaseListFilters } from "@/shared/lib/store/create-list-filter-store"

import type { FilterCriterion, LeadScope } from "../../domain/advanced-filter.types"

export interface LeadsFilters extends BaseListFilters {
  /** Structured criteria from the filter drawer. Empty means the plain list endpoint is used. */
  criteria: FilterCriterion[]
  scope: LeadScope
}

const defaultFilters: LeadsFilters = {
  search: "",
  searchFields: "",
  fromDate: undefined,
  toDate: undefined,
  dateType: "created",
  criteria: [],
  scope: "ALL"
}

export const useLeadsFilterStore = createListFilterStore<LeadsFilters>(defaultFilters)
