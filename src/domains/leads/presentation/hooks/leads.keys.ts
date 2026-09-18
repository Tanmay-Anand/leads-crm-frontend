import type { AdvancedSearchRequest } from "../../domain/advanced-filter.types"
import type { GetLeadsParams } from "../../infrastructure/api/leads.service"

/**
 * Query keys for the lead domain.
 *
 * Hierarchical so a write can invalidate every list in one call without touching the master-data
 * reads, which change on a different schedule.
 */
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (input: { params: GetLeadsParams; advanced?: AdvancedSearchRequest }) =>
    [...leadKeys.lists(), input] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
  summary: () => [...leadKeys.all, "summary"] as const,
  enums: () => [...leadKeys.all, "enums"] as const,
  filterFields: () => [...leadKeys.all, "filter-fields"] as const,
  filterOptions: (optionsSource: string) => [...leadKeys.all, "filter-options", optionsSource] as const,
  notes: (leadId: string) => [...leadKeys.all, "notes", leadId] as const,
  statuses: () => [...leadKeys.all, "statuses"] as const,
  temperatures: () => [...leadKeys.all, "temperatures"] as const,
  tags: () => [...leadKeys.all, "tags"] as const,
  sourceCategories: () => [...leadKeys.all, "source-categories"] as const,
  sourceTypes: (parentId?: string) => [...leadKeys.all, "source-types", parentId ?? "all"] as const,
  whatsappMessages: (phoneNumber: string, page: number) =>
    [...leadKeys.all, "whatsapp-messages", phoneNumber, page] as const
}
