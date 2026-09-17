import type { Address } from "@/domains/leads/domain/types"

export type ChannelPartnerType = "CHANNEL_PARTNER" | "BROKER"

export type ChannelPartnerTier = "SILVER" | "GOLD" | "PLATINUM"

export type ChannelPartnerOnboardingStatus = "DRAFT" | "ACTIVE" | "SUSPENDED"

export type PrimaryMarket =
  | "PRIMARY_NEW_PROJECTS"
  | "SECONDARY_RESALE"
  | "COMMERCIAL"
  | "LUXURY"
  | "AFFORDABLE"

export type BankAccountType = "CURRENT" | "SAVINGS" | "OVERDRAFT" | "NRE" | "NRO"

export type CommissionType = "PERCENTAGE" | "FLAT"

export type CommissionPayoutTrigger = "ON_BOOKING" | "ON_AGREEMENT" | "ON_REGISTRATION" | "ON_POSSESSION"

export interface ChannelPartnerDto {
  id?: string
  tenantId?: string
  name: string
  partnerType?: ChannelPartnerType | null
  ownerPocName?: string | null
  primaryCountryCode?: string | null
  primaryPhone?: string | null
  secondaryCountryCode?: string | null
  secondaryPhone?: string | null
  email: string
  alternateEmail?: string | null
  reraRegNumber?: string | null
  reraVerified?: boolean | null
  address?: Address | null
  whatsappNo?: string | null
  numberOfSalesAgents?: number | null
  yearsInBusiness?: number | null
  primaryMarket?: PrimaryMarket | null
  gstNumber?: string | null
  ownerPan?: string | null
  bankName?: string | null
  bankAccountNumber?: string | null
  ifscCode?: string | null
  accountType?: BankAccountType | null
  tier?: ChannelPartnerTier | null
  assignedProjects?: string[] | null
  commissionType?: CommissionType | null
  commissionRate?: number | null
  commissionPayoutTrigger?: CommissionPayoutTrigger | null
  paymentTermsDays?: number | null
  onboardingStatus?: ChannelPartnerOnboardingStatus | null
  /** Active leads attributed to this partner. Read-only. */
  leadCount?: number | null
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  lastModifiedBy?: string | null
  isActive?: boolean | null
}

export interface ChannelPartnerNamesDto {
  id: string
  name: string
}

export interface ChannelPartnerStatsDto {
  total: number
  active: number
  drafts: number
  platinum: number
}

export type ChannelPartnerSearchField =
  | "FIRM_NAME"
  | "OWNER_NAME"
  | "EMAIL"
  | "PHONE"
  | "RERA_NUMBER"
  | "CITY"
  | "TIER"
