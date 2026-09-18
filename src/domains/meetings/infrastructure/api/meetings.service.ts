import { api } from "@/infrastructure/http/api.client"

import type { CreateMeetingRequest, MeetingDto, UpdateMeetingRequest } from "../../domain/types"

const leadsApi = api.getService("leads")
const meetingsApi = api.getService("meetings")

export const meetingsService = {
  getByLead: (leadId: string): Promise<MeetingDto[]> => leadsApi.get(`/${leadId}/meetings`),

  schedule: (leadId: string, data: CreateMeetingRequest): Promise<MeetingDto> =>
    leadsApi.post(`/${leadId}/meetings`, data),

  getUpcoming: (scope: "me" | "team"): Promise<MeetingDto[]> => meetingsApi.get(`/upcoming?scope=${scope}`),

  reschedule: (meetingId: string, data: UpdateMeetingRequest): Promise<MeetingDto> =>
    meetingsApi.patch(`/${meetingId}`, data),

  cancel: (meetingId: string): Promise<MeetingDto> => meetingsApi.post(`/${meetingId}/cancel`, {}),

  complete: (meetingId: string): Promise<MeetingDto> => meetingsApi.post(`/${meetingId}/complete`, {})
}
