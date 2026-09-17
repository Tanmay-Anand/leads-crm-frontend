import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import LeadsPage from "@/domains/leads/presentation/pages/leads-page"

/**
 * List state that belongs in the URL, so a filtered view can be shared or reloaded.
 *
 * Advanced-search criteria deliberately do not travel here: an arbitrary criteria list is what
 * made that search a POST in the first place.
 */
const leadsSearchSchema = z.object({
  page: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  sort: z.string().optional(),
  search: z.coerce.string().optional(),
  searchFields: z.coerce.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  dateType: z.string().optional(),
  scope: z.string().optional()
})

export const Route = createFileRoute("/_protected/leads/")({
  validateSearch: leadsSearchSchema,
  component: LeadsPage
})
