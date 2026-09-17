import { api } from "@/infrastructure/http/api.client"
import { buildListQuery, createSearchFieldMapper } from "@/shared/lib/utils"
import type { Paginated } from "@/shared/types/api"

import type {
  ChannelPartnerDto,
  ChannelPartnerNamesDto,
  ChannelPartnerSearchField,
  ChannelPartnerStatsDto
} from "../../domain/types"

const channelPartnersApi = api.getService("channel-partners")

/** Toolbar field ids to the backend ChannelPartnerSearchField enum. */
const SEARCH_FIELD_TO_ENUM: Record<string, ChannelPartnerSearchField> = {
  name: "FIRM_NAME",
  ownerPocName: "OWNER_NAME",
  email: "EMAIL",
  primaryPhone: "PHONE",
  reraRegNumber: "RERA_NUMBER",
  city: "CITY",
  tier: "TIER"
}

export const toChannelPartnerSearchFields = createSearchFieldMapper(SEARCH_FIELD_TO_ENUM)

export interface GetChannelPartnersParams {
  page?: number
  size?: number
  sort?: string
  q?: string
  searchFields?: ChannelPartnerSearchField[]
  fromDate?: string
  toDate?: string
}

export const channelPartnersService = {
  getChannelPartners: (params: GetChannelPartnersParams): Promise<Paginated<ChannelPartnerDto>> =>
    channelPartnersApi.get(buildListQuery(params)),

  getNames: (): Promise<ChannelPartnerNamesDto[]> => channelPartnersApi.get("/names"),

  getStats: (): Promise<ChannelPartnerStatsDto> => channelPartnersApi.get("/stats"),

  getChannelPartner: (id: string): Promise<ChannelPartnerDto> => channelPartnersApi.get(`/${id}`),

  createChannelPartner: (data: ChannelPartnerDto): Promise<ChannelPartnerDto> =>
    channelPartnersApi.post("", data),

  updateChannelPartner: (id: string, data: ChannelPartnerDto): Promise<ChannelPartnerDto> =>
    channelPartnersApi.put(`/${id}`, data),

  deleteChannelPartner: (id: string): Promise<void> => channelPartnersApi.delete(`/${id}`)
}
