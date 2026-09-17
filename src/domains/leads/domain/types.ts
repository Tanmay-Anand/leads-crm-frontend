/** Lead read and write models, mirroring the backend lead DTOs. */

export interface Address {
  line1?: string | null
  line2?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
}

export type PropertyCategory = "RESIDENTIAL" | "COMMERCIAL" | "PLOT" | "AGRICULTURE"

export type PurchaseTimeline =
  | "IMMEDIATE"
  | "ONE_MONTH"
  | "THREE_MONTHS"
  | "SIX_MONTHS"
  | "ONE_YEAR"
  | "EXPLORING"

export type AssignmentMethod = "MANUAL" | "ROUND_ROBIN" | "POOL"

export type LeadNoteType = "NOTE" | "CALL" | "WHATSAPP" | "EMAIL" | "SITE_VISIT" | "DOCUMENT_LINK"

/** Derived from scheduleDate on the server; null when nothing is scheduled. */
export type SlaStatus = "OVERDUE" | "DUE_TODAY" | "ON_TRACK"

export interface LeadStatusDto {
  id: string
  name: string
  displayName?: string | null
  colorCode?: string | null
  isDefault: boolean
  isNoteRequired: boolean
  displayOrder: number
}

export interface TemperatureDto {
  id: string
  name: string
  displayName?: string | null
  colorCode?: string | null
}

export interface TagDto {
  id: string
  name: string
  displayName?: string | null
  colorCode?: string | null
}

export interface SourceCategoryDto {
  id: string
  name: string
  displayName?: string | null
  colorCode?: string | null
}

export interface SourceTypeDto extends SourceCategoryDto {
  parentId?: string | null
}

export interface LeadDto {
  id: string
  tenantId?: string
  leadCode?: string | null
  firstName?: string | null
  lastName?: string | null
  mobile: string
  countryCode?: string | null
  alternateMobile?: string | null
  alternateCountryCode?: string | null
  email?: string | null
  occupation?: string | null
  address?: Address | null
  propertyCategory?: PropertyCategory | null
  purchaseTimeline?: PurchaseTimeline | null
  temperature?: TemperatureDto | null
  status?: LeadStatusDto | null
  sourceCategory?: SourceCategoryDto | null
  sourceType?: SourceTypeDto | null
  assignedTo?: string | null
  assignedToName?: string | null
  assignmentMethod?: AssignmentMethod | null
  scheduleDate?: string | null
  slaStatus?: SlaStatus | null
  notes?: string | null
  isNri: boolean
  isDraft: boolean
  projectId?: string | null
  channelPartnerId?: string | null
  channelPartnerName?: string | null
  telecallerId?: string | null
  telecallerName?: string | null
  tags?: TagDto[] | null
  createdByUserId?: string | null
  lastModifiedByUserId?: string | null
  createdOn?: string | null
  modifiedOn?: string | null
  createdBy?: string | null
  lastModifiedBy?: string | null
  isDeleted: boolean
  isActive?: boolean | null
}

export interface CreateLeadRequest {
  firstName: string
  lastName?: string
  mobile: string
  countryCode?: string
  alternateMobile?: string
  alternateCountryCode?: string
  email?: string
  occupation?: string
  address?: Address
  propertyCategory: PropertyCategory
  purchaseTimeline?: PurchaseTimeline
  projectId?: string | null
  channelPartnerId?: string | null
  telecallerId?: string | null
  telecallerName?: string | null
  assignedTo?: string | null
  assignedToUserName?: string | null
  assignmentMethod?: AssignmentMethod | null
  statusId?: string | null
  temperatureId?: string | null
  sourceCategoryId?: string | null
  sourceTypeId?: string | null
  tagIds?: string[]
  notes?: string
  isNri: boolean
  isDraft: boolean
  scheduleDate?: string | null
}

export interface LeadNoteDto {
  id: string
  leadId: string
  type: LeadNoteType
  body: string
  externalReference?: string | null
  performedByUserId?: string | null
  performedByUsername?: string | null
  createdOn?: string | null
}

export interface LeadNoteRequest {
  type: LeadNoteType
  body: string
  externalReference?: string
}

export interface LeadStatusUpdateRequest {
  statusId: string
  note?: string
}

export interface LeadSummaryDto {
  total: number
  createdThisMonth: number
  unassigned: number
  dueToday: number
  byStatus: {
    statusId: string
    statusName: string
    colorCode?: string | null
    count: number
  }[]
}

export interface DuplicateCheckResponse {
  exists: boolean
  lead: LeadDto | null
}

/** Scopes the toolbar can restrict the free-text search to. */
export type LeadSearchField =
  | "NAME"
  | "LEAD_CODE"
  | "MOBILE"
  | "EMAIL"
  | "ASSIGNED_TO"
  | "CHANNEL_PARTNER"
  | "TELECALLER"
  | "PROPERTY_CATEGORY"
  | "STATUS"
  | "TEMPERATURE"
  | "TAG"
  | "CITY"

export interface EnumOption {
  code: string
  label: string
}

export type LeadEnums = Record<string, EnumOption[]>
