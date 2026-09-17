import type { Address } from "@/domains/leads/domain/types"

export type ProjectStage = "PLANNING" | "PRE_LAUNCH" | "LAUNCHED" | "DELIVERED"

export type ProjectType = "RESIDENTIAL_APARTMENT" | "RESIDENTIAL_VILLA" | "COMMERCIAL" | "MIXED_USE"

export type AreaUnit = "SQM" | "SQFT" | "ACRES" | "HECTARES"

export type Region = "INDIA" | "DUBAI"

export type SaveStatus = "DRAFT" | "COMPLETED"

export interface ProjectDto {
  id?: string
  tenantId?: string
  name: string
  brand?: string | null
  legalEntity?: string | null
  projectStage?: ProjectStage | null
  region?: Region | null
  startDate?: string | null
  projectType?: ProjectType | null
  expectedCompletionDate?: string | null
  brief?: string | null
  reraNumber?: string | null
  reraState?: string | null
  description?: string | null
  address?: Address | null
  saveStatus?: SaveStatus | null
  microMarket?: string | null
  googleMapsLink?: string | null
  projectMicrosite?: string | null
  totalLandArea?: number | null
  areaUnit?: AreaUnit | null
  occupancyCertificateTargetDate?: string | null
  /** Active leads pointing at this project. Read-only. */
  leadCount?: number | null
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  lastModifiedBy?: string | null
  isActive?: boolean | null
}

export interface ProjectNamesDto {
  id: string
  name: string
}

export interface ProjectStatsDto {
  total: number
  drafts: number
  launched: number
  delivered: number
}

export type ProjectSearchField =
  | "NAME"
  | "BRAND"
  | "CITY"
  | "STATE"
  | "MICRO_MARKET"
  | "RERA_NUMBER"
  | "RERA_STATE"
  | "PROJECT_TYPE"
  | "PROJECT_STAGE"
