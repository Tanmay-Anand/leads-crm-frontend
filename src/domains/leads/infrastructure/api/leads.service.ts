import { api } from "@/infrastructure/http/api.client"
import { buildListQuery, createSearchFieldMapper } from "@/shared/lib/utils"
import type { FilterOption, Paginated } from "@/shared/types/api"

import type { AdvancedSearchRequest, FilterFieldDto } from "../../domain/advanced-filter.types"
import type {
  CreateLeadRequest,
  DuplicateCheckResponse,
  LeadDto,
  LeadEnums,
  LeadNoteDto,
  LeadNoteRequest,
  LeadSearchField,
  LeadStatusDto,
  LeadStatusUpdateRequest,
  LeadSummaryDto,
  SourceCategoryDto,
  SourceTypeDto,
  TagDto,
  TemperatureDto
} from "../../domain/types"

const leadsApi = api.getService("leads")
const tagsApi = api.getService("tags")
const temperaturesApi = api.getService("temperatures")
const sourceCategoriesApi = api.getService("source-categories")
const sourceTypesApi = api.getService("source-types")

/**
 * Toolbar field ids to the backend LeadSearchField enum.
 *
 * firstName and lastName both map to NAME, because the backend searches first OR last as one
 * field. An id with no entry is dropped rather than sent: the backend rejects an unknown enum
 * value with a 400, so passing one through would break the whole search over one bad chip.
 */
const SEARCH_FIELD_TO_ENUM: Record<string, LeadSearchField> = {
  firstName: "NAME",
  lastName: "NAME",
  name: "NAME",
  leadCode: "LEAD_CODE",
  mobile: "MOBILE",
  email: "EMAIL",
  assignedToName: "ASSIGNED_TO",
  channelPartnerName: "CHANNEL_PARTNER",
  telecallerName: "TELECALLER",
  propertyCategory: "PROPERTY_CATEGORY",
  status: "STATUS",
  temperature: "TEMPERATURE",
  tag: "TAG",
  city: "CITY"
}

export const toLeadSearchFields = createSearchFieldMapper(SEARCH_FIELD_TO_ENUM)

export interface GetLeadsParams {
  page?: number
  size?: number
  sort?: string
  q?: string
  searchFields?: LeadSearchField[]
  fromDate?: string
  toDate?: string
  dateType?: string
}

export const leadsService = {
  /**
   * The single read behind the list view.
   *
   * q, the date range and paging all compose, so the toolbar never has to choose between
   * searching and filtering. Callers must omit q below two characters, which is the minimum the
   * backend will act on.
   */
  getLeads: (params: GetLeadsParams): Promise<Paginated<LeadDto>> => leadsApi.get(buildListQuery(params)),

  advancedSearch: (
    request: AdvancedSearchRequest,
    params: { page?: number; size?: number; sort?: string; onUnknownField?: "REJECT" | "SKIP" } = {}
  ): Promise<Paginated<LeadDto>> =>
    leadsApi.post(`/advanced-search${buildListQuery(params)}`, request),

  getFilterFields: (): Promise<FilterFieldDto[]> => leadsApi.get("/filter-fields"),

  getFilterOptions: (optionsSource: string): Promise<FilterOption[]> =>
    leadsApi.get(`/filter-options/${optionsSource}`),

  getSummary: (): Promise<LeadSummaryDto> => leadsApi.get("/summary"),

  getEnums: (): Promise<LeadEnums> => leadsApi.get("/enums"),

  getLead: (id: string): Promise<LeadDto> => leadsApi.get(`/${id}`),

  /**
   * projectId matters: a lead is unique per tenant, project and mobile, so the same person may
   * legitimately exist on another project. Omitting it asks about the project-less bucket.
   */
  checkMobile: (mobile: string, countryCode?: string, projectId?: string): Promise<DuplicateCheckResponse> =>
    leadsApi.get(`/check-mobile${buildListQuery({ mobile, countryCode, projectId })}`),

  createLead: (data: CreateLeadRequest): Promise<LeadDto> => leadsApi.post("", data),

  updateLead: (id: string, data: CreateLeadRequest): Promise<LeadDto> => leadsApi.put(`/${id}`, data),

  updateStatus: (id: string, data: LeadStatusUpdateRequest): Promise<LeadDto> =>
    leadsApi.patch(`/${id}/status`, data),

  updateTags: (id: string, tagIds: string[]): Promise<LeadDto> => leadsApi.patch(`/${id}/tags`, { tagIds }),

  updateTemperature: (id: string, temperatureId: string): Promise<LeadDto> =>
    leadsApi.patch(`/${id}/temperature`, { temperatureId }),

  deleteLead: (id: string): Promise<void> => leadsApi.delete(`/${id}`),

  // ── Notes ───────────────────────────────────────────────────────────────────

  getNotes: (leadId: string, params: { page?: number; size?: number } = {}): Promise<Paginated<LeadNoteDto>> =>
    leadsApi.get(`/${leadId}/notes${buildListQuery(params)}`),

  addNote: (leadId: string, data: LeadNoteRequest): Promise<LeadNoteDto> =>
    leadsApi.post(`/${leadId}/notes`, data),

  deleteNote: (leadId: string, noteId: string): Promise<void> => leadsApi.delete(`/${leadId}/notes/${noteId}`),

  // ── Master data the lead form needs ─────────────────────────────────────────

  getStatuses: (): Promise<LeadStatusDto[]> => leadsApi.get("/statuses/list"),

  getTags: (): Promise<TagDto[]> => tagsApi.get(""),

  getTemperatures: (): Promise<TemperatureDto[]> => temperaturesApi.get(""),

  getSourceCategories: (): Promise<SourceCategoryDto[]> => sourceCategoriesApi.get(""),

  getSourceTypes: (parentId?: string): Promise<SourceTypeDto[]> => sourceTypesApi.get(buildListQuery({ parentId }))
}
