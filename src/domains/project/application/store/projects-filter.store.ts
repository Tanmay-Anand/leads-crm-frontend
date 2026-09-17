import { createListFilterStore, type BaseListFilters } from "@/shared/lib/store/create-list-filter-store"

export type ProjectsFilters = BaseListFilters

const defaultFilters: ProjectsFilters = {
  search: "",
  searchFields: "",
  fromDate: undefined,
  toDate: undefined,
  dateType: "created"
}

export const useProjectsFilterStore = createListFilterStore<ProjectsFilters>(defaultFilters)
