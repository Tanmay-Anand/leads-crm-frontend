import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  channelPartnersService,
  type GetChannelPartnersParams
} from "../../infrastructure/api/channel-partners.service"

import { channelPartnerKeys } from "./channel-partners.keys"

import type { ChannelPartnerDto } from "../../domain/types"

export const useChannelPartnersPaginated = (params: GetChannelPartnersParams) =>
  useQuery({
    queryKey: channelPartnerKeys.list(params),
    queryFn: () => channelPartnersService.getChannelPartners(params),
    placeholderData: previous => previous
  })

/** Id and name pairs, for the partner picker on the lead form. */
export const useChannelPartnerNames = () =>
  useQuery({
    queryKey: channelPartnerKeys.names(),
    queryFn: channelPartnersService.getNames,
    staleTime: 5 * 60 * 1_000
  })

export const useChannelPartnerStats = () =>
  useQuery({
    queryKey: channelPartnerKeys.stats(),
    queryFn: channelPartnersService.getStats
  })

export const useChannelPartner = (id?: string) =>
  useQuery({
    queryKey: channelPartnerKeys.detail(id ?? ""),
    queryFn: () => channelPartnersService.getChannelPartner(id!),
    enabled: Boolean(id)
  })

const useInvalidateChannelPartners = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: channelPartnerKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: channelPartnerKeys.names() })
    void queryClient.invalidateQueries({ queryKey: channelPartnerKeys.stats() })
  }
}

export const useCreateChannelPartner = () => {
  const invalidate = useInvalidateChannelPartners()
  return useMutation({
    mutationFn: (data: ChannelPartnerDto) => channelPartnersService.createChannelPartner(data),
    onSuccess: partner => {
      toast.success(`Channel partner ${partner.name} created`)
      invalidate()
    }
  })
}

export const useUpdateChannelPartner = () => {
  const invalidate = useInvalidateChannelPartners()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ChannelPartnerDto }) =>
      channelPartnersService.updateChannelPartner(id, data),
    onSuccess: () => {
      toast.success("Channel partner updated")
      invalidate()
    }
  })
}

export const useDeleteChannelPartner = () => {
  const invalidate = useInvalidateChannelPartners()
  return useMutation({
    mutationFn: (id: string) => channelPartnersService.deleteChannelPartner(id),
    onSuccess: () => {
      toast.success("Channel partner deleted")
      invalidate()
    }
  })
}
