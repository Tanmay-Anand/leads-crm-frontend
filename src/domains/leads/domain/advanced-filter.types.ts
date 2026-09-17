/**
 * The advanced-search contract, mirroring the backend search/advanced package.
 *
 * The filter drawer is generated from FilterFieldDto rather than hard-coded, so adding a field on
 * the server adds a control here with no frontend change.
 */

export type FilterOperator =
  | "EQ"
  | "NE"
  | "IN"
  | "NOT_IN"
  | "CONTAINS"
  | "STARTS_WITH"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "BETWEEN"
  | "IS_NULL"
  | "IS_NOT_NULL"
  | "ANY_OF"

export type FilterValueType =
  | "STRING"
  | "NUMBER"
  | "DECIMAL"
  | "BOOLEAN"
  | "DATE"
  | "DATETIME"
  | "UUID"
  | "ENUM"
  | "LOOKUP"
  | "ID_SET"

export type FilterGroup =
  | "ASSIGNMENT"
  | "STATUS_AND_SOURCE"
  | "PROPERTY_REQUIREMENT"
  | "ADDITIONAL_INFO"
  | "PROJECT_DETAILS"
  | "LOCATION"
  | "FIRM"
  | "COMMISSION"
  | "DATES"
  | "OTHERS"

export interface FilterFieldDto {
  key: string
  label: string
  group: FilterGroup
  valueType: FilterValueType
  operators: FilterOperator[]
  /** Names the dropdown to lazily fetch. Null for free entry. */
  optionsSource: string | null
  multi: boolean
}

export interface FilterCriterion {
  field: string
  operator: FilterOperator
  values: string[]
}

export type LeadScope = "ALL" | "MINE" | "UNASSIGNED"

export interface AdvancedSearchRequest {
  criteria: FilterCriterion[]
  q?: string
  qFields?: string[]
  scope?: LeadScope
  fromDate?: string
  toDate?: string
  dateType?: string
}

/** Human labels for the drawer sections, in the order they should appear. */
export const FILTER_GROUP_ORDER: FilterGroup[] = [
  "ASSIGNMENT",
  "STATUS_AND_SOURCE",
  "PROPERTY_REQUIREMENT",
  "PROJECT_DETAILS",
  "LOCATION",
  "FIRM",
  "COMMISSION",
  "ADDITIONAL_INFO",
  "DATES",
  "OTHERS"
]

export const FILTER_GROUP_LABELS: Record<FilterGroup, string> = {
  ASSIGNMENT: "Assignment",
  STATUS_AND_SOURCE: "Status and source",
  PROPERTY_REQUIREMENT: "Property requirement",
  ADDITIONAL_INFO: "Additional info",
  PROJECT_DETAILS: "Project details",
  LOCATION: "Location",
  FIRM: "Firm",
  COMMISSION: "Commission",
  DATES: "Dates",
  OTHERS: "Others"
}
