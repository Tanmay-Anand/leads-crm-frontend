import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import ChannelPartnersPage from "@/domains/channel-partners/presentation/pages/channel-partners-page"

const channelPartnersSearchSchema = z.object({
  page: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  sort: z.string().optional(),
  search: z.coerce.string().optional(),
  searchFields: z.coerce.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
})

export const Route = createFileRoute("/_protected/channel-partners/")({
  validateSearch: channelPartnersSearchSchema,
  component: ChannelPartnersPage
})
