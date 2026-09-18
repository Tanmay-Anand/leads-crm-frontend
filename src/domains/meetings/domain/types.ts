/** Meeting read and write models, mirroring the backend LeadMeeting DTOs. */

export type MeetingStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED"

export interface MeetingDto {
  id: string
  leadId: string
  title?: string | null
  agenda?: string | null
  scheduledAt: string
  durationMinutes: number
  timezone?: string | null
  meetingLink?: string | null
  status: MeetingStatus
  calendarSyncStatus?: string | null
  calendarSyncError?: string | null
  recallBotStatus?: string | null
  assignedUserId?: string | null
  assignedUserEmail?: string | null
  assignedUserName?: string | null
}

export interface CreateMeetingRequest {
  title?: string
  agenda?: string
  scheduledAt: string
  durationMinutes?: number
  timezone?: string
  assignedUserId?: string
}

export interface UpdateMeetingRequest {
  title?: string
  agenda?: string
  scheduledAt?: string
  durationMinutes?: number
  timezone?: string
  assignedUserId?: string
}
