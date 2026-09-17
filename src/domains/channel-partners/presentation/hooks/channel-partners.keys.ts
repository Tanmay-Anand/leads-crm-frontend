import type { GetChannelPartnersParams } from "../../infrastructure/api/channel-partners.service"

export const channelPartnerKeys = {
  all: ["channel-partners"] as const,
  lists: () => [...channelPartnerKeys.all, "list"] as const,
  list: (params: GetChannelPartnersParams) => [...channelPartnerKeys.lists(), params] as const,
  detail: (id: string) => [...channelPartnerKeys.all, "detail", id] as const,
  names: () => [...channelPartnerKeys.all, "names"] as const,
  stats: () => [...channelPartnerKeys.all, "stats"] as const
}
