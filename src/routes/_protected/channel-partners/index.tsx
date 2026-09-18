import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { requireRoutePermission } from "@/domains/authorization/application/route-guards"
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
  beforeLoad: ({ context }) => {
    if (!requireRoutePermission(context.queryClient, "view", "channel-partners")) {
      throw redirect({ to: "/forbidden" })
    }
  },
  validateSearch: channelPartnersSearchSchema,
  component: ChannelPartnersPage
})
