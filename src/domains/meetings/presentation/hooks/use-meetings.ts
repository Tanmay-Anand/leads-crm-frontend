import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ApiError } from "@/infrastructure/http/api.client"

import { meetingsService } from "../../infrastructure/api/meetings.service"

import { meetingKeys } from "./meetings.keys"

import type { CreateMeetingRequest, UpdateMeetingRequest } from "../../domain/types"

export const useLeadMeetings = (leadId?: string) =>
  useQuery({
    queryKey: meetingKeys.byLead(leadId ?? ""),
    queryFn: () => meetingsService.getByLead(leadId!),
    enabled: Boolean(leadId)
  })

export const useUpcomingMeetings = (scope: "me" | "team") =>
  useQuery({
    queryKey: meetingKeys.upcoming(scope),
    queryFn: () => meetingsService.getUpcoming(scope)
  })

const useInvalidateMeetings = () => {
  const queryClient = useQueryClient()
  return () => void queryClient.invalidateQueries({ queryKey: meetingKeys.all })
}

export const useScheduleMeeting = () => {
  const invalidate = useInvalidateMeetings()
  return useMutation({
    mutationFn: ({ leadId, data }: { leadId: string; data: CreateMeetingRequest }) =>
      meetingsService.schedule(leadId, data),
    onSuccess: meeting => {
      toast.success(`Meeting link generated for ${meeting.assignedUserName ?? "the assignee"}`)
      invalidate()
    },
    onError: (error: ApiError) => {
      toast.error(error.data?.message || "Could not generate the meeting link")
    }
  })
}

export const useRescheduleMeeting = () => {
  const invalidate = useInvalidateMeetings()
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: string; data: UpdateMeetingRequest }) =>
      meetingsService.reschedule(meetingId, data),
    onSuccess: () => {
      toast.success("Meeting updated")
      invalidate()
    }
  })
}

export const useCancelMeeting = () => {
  const invalidate = useInvalidateMeetings()
  return useMutation({
    mutationFn: (meetingId: string) => meetingsService.cancel(meetingId),
    onSuccess: () => {
      toast.success("Meeting cancelled")
      invalidate()
    }
  })
}
