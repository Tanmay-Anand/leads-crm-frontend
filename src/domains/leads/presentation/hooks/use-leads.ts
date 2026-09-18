import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { toast } from "sonner"

import type { FilterOption, Paginated } from "@/shared/types/api"

import { leadsService, type GetLeadsParams } from "../../infrastructure/api/leads.service"
import { whatsappService } from "../../infrastructure/api/whatsapp.service"

import { leadKeys } from "./leads.keys"

import type { AdvancedSearchRequest } from "../../domain/advanced-filter.types"
import type {
  CreateLeadRequest,
  LeadDto,
  LeadNoteRequest,
  LeadStatusUpdateRequest
} from "../../domain/types"


/**
 * The list read.
 *
 * Two endpoints back one screen: the plain list with a text search, and advanced search when the
 * drawer has criteria. Which one runs is decided here rather than in the page, so the page has a
 * single hook whatever the user is filtering by, and the query key covers both so switching
 * between them does not serve a cached page from the other endpoint.
 */
export const useLeadsPaginated = (
  params: GetLeadsParams,
  advanced?: AdvancedSearchRequest,
  options?: { enabled?: boolean }
) => {
  const useAdvanced = Boolean(advanced && advanced.criteria.length > 0)

  return useQuery({
    queryKey: leadKeys.list({ params, advanced: useAdvanced ? advanced : undefined }),
    queryFn: (): Promise<Paginated<LeadDto>> => {
      if (useAdvanced && advanced) {
        return leadsService.advancedSearch(
          {
            ...advanced,
            q: params.q,
            fromDate: params.fromDate,
            toDate: params.toDate,
            dateType: params.dateType
          },
          {
            page: params.page,
            size: params.size,
            sort: params.sort,
            // A saved or stale criterion naming a field that no longer exists should narrow the
            // search oddly, not fail the page.
            onUnknownField: "SKIP"
          }
        )
      }
      return leadsService.getLeads(params)
    },
    enabled: options?.enabled ?? true,
    placeholderData: previous => previous
  })
}

export const useLeadSummary = () =>
  useQuery({
    queryKey: leadKeys.summary(),
    queryFn: leadsService.getSummary
  })

export const useLead = (id?: string) =>
  useQuery({
    queryKey: leadKeys.detail(id ?? ""),
    queryFn: () => leadsService.getLead(id!),
    enabled: Boolean(id)
  })

export const useLeadFilterFields = () =>
  useQuery({
    queryKey: leadKeys.filterFields(),
    queryFn: leadsService.getFilterFields,
    // The field set changes only when the backend deploys, so it is worth holding for the session.
    staleTime: Infinity
  })

/**
 * Options behind one filter dropdown.
 *
 * Fetched only once the user opens that dropdown, which is why the drawer can offer a dozen
 * lookups without a dozen requests on page load.
 */
export const useFilterOptions = (
  optionsSource: string | null | undefined,
  options?: Partial<UseQueryOptions<FilterOption[]>>
) =>
  useQuery({
    queryKey: leadKeys.filterOptions(optionsSource ?? ""),
    queryFn: () => leadsService.getFilterOptions(optionsSource!),
    enabled: Boolean(optionsSource) && (options?.enabled ?? true),
    staleTime: 5 * 60 * 1_000
  })

export const useLeadEnums = () =>
  useQuery({
    queryKey: leadKeys.enums(),
    queryFn: leadsService.getEnums,
    staleTime: Infinity
  })

export const useLeadStatuses = () =>
  useQuery({
    queryKey: leadKeys.statuses(),
    queryFn: leadsService.getStatuses,
    staleTime: 5 * 60 * 1_000
  })

export const useTemperatures = () =>
  useQuery({
    queryKey: leadKeys.temperatures(),
    queryFn: leadsService.getTemperatures,
    staleTime: 5 * 60 * 1_000
  })

export const useTags = () =>
  useQuery({
    queryKey: leadKeys.tags(),
    queryFn: leadsService.getTags,
    staleTime: 5 * 60 * 1_000
  })

export const useSourceCategories = () =>
  useQuery({
    queryKey: leadKeys.sourceCategories(),
    queryFn: leadsService.getSourceCategories,
    staleTime: 5 * 60 * 1_000
  })

export const useSourceTypes = (parentId?: string) =>
  useQuery({
    queryKey: leadKeys.sourceTypes(parentId),
    queryFn: () => leadsService.getSourceTypes(parentId),
    staleTime: 5 * 60 * 1_000
  })

export const useLeadNotes = (leadId?: string) =>
  useQuery({
    queryKey: leadKeys.notes(leadId ?? ""),
    queryFn: () => leadsService.getNotes(leadId!, { size: 50 }),
    enabled: Boolean(leadId)
  })

export const useWhatsAppMessages = (phoneNumber?: string, page = 1) =>
  useQuery({
    queryKey: leadKeys.whatsappMessages(phoneNumber ?? "", page),
    queryFn: () => whatsappService.getMessages(phoneNumber!, { pageNumber: page, pageSize: 50 }),
    enabled: Boolean(phoneNumber),
    // The conversation is someone else's inbox; poll gently rather than only on open, so a reply
    // that comes in while the tab is sitting open still shows up without a manual refresh.
    refetchInterval: 30 * 1_000,
    retry: false
  })

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Invalidates everything a lead write can change.
 *
 * Broad on purpose: a status change moves the lead between the counts on the summary tiles as
 * well as its row, and getting that wrong shows a stale KPI beside fresh data.
 */
const useInvalidateLeads = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: leadKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: leadKeys.summary() })
  }
}

export const useCreateLead = () => {
  const invalidate = useInvalidateLeads()
  return useMutation({
    mutationFn: (data: CreateLeadRequest) => leadsService.createLead(data),
    onSuccess: lead => {
      toast.success(`Lead ${lead.leadCode ?? ""} created`.trim())
      invalidate()
    }
  })
}

export const useUpdateLead = () => {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateLeads()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateLeadRequest }) => leadsService.updateLead(id, data),
    onSuccess: lead => {
      toast.success("Lead updated")
      queryClient.setQueryData(leadKeys.detail(lead.id), lead)
      invalidate()
    }
  })
}

export const useUpdateLeadStatus = () => {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateLeads()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LeadStatusUpdateRequest }) =>
      leadsService.updateStatus(id, data),
    onSuccess: lead => {
      toast.success("Status updated")
      queryClient.setQueryData(leadKeys.detail(lead.id), lead)
      void queryClient.invalidateQueries({ queryKey: leadKeys.notes(lead.id) })
      invalidate()
    }
  })
}

export const useDeleteLead = () => {
  const invalidate = useInvalidateLeads()
  return useMutation({
    mutationFn: (id: string) => leadsService.deleteLead(id),
    onSuccess: () => {
      toast.success("Lead deleted")
      invalidate()
    }
  })
}

export const useAddLeadNote = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: LeadNoteRequest }) =>
      leadsService.addNote(leadId, data),
    onSuccess: note => {
      toast.success("Note added")
      void queryClient.invalidateQueries({ queryKey: leadKeys.notes(note.leadId) })
    }
  })
}
