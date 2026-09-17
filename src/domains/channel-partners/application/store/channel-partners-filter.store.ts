import { createListFilterStore, type BaseListFilters } from "@/shared/lib/store/create-list-filter-store"

export type ChannelPartnersFilters = BaseListFilters

const defaultFilters: ChannelPartnersFilters = {
  search: "",
  searchFields: "",
  fromDate: undefined,
  toDate: undefined,
  dateType: "created"
}

export const useChannelPartnersFilterStore = createListFilterStore<ChannelPartnersFilters>(defaultFilters)
