import { useState } from "react"

import { Copy, Plus, Video } from "lucide-react"
import { toast } from "sonner"

import type { LeadDto } from "@/domains/leads/domain/types"
import { formatDate } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"

import { useCancelMeeting, useLeadMeetings } from "../hooks/use-meetings"

import { MeetingFormDialog } from "./meeting-form-dialog"

import type { MeetingStatus } from "../../domain/types"

const STATUS_VARIANT: Record<MeetingStatus, "default" | "secondary" | "destructive"> = {
  SCHEDULED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive"
}

export function LeadMeetingsPanel({ lead }: { lead: LeadDto }) {
  const { data: meetings } = useLeadMeetings(lead.id)
  const cancelMeeting = useCancelMeeting()
  const [dialogOpen, setDialogOpen] = useState(false)

  const copyLink = async (link: string) => {
    await navigator.clipboard.writeText(link)
    toast.success("Meeting link copied")
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-3.5" />
          Generate meeting link
        </Button>
      </div>

      {!meetings || meetings.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">No meetings scheduled for this lead yet.</p>
      ) : (
        <ul className="space-y-2">
          {meetings.map(meeting => (
            <li key={meeting.id} className="space-y-1.5 rounded-md border p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{meeting.title ?? "Meeting"}</span>
                <Badge variant={STATUS_VARIANT[meeting.status]}>{meeting.status}</Badge>
              </div>
              <p className="text-muted-foreground text-xs">
                {formatDate(meeting.scheduledAt, true)} &middot; {meeting.durationMinutes}m &middot; assigned to{" "}
                {meeting.assignedUserName ?? "unassigned"}
              </p>
              {meeting.calendarSyncStatus === "FAILED" && (
                <p className="text-destructive text-xs">Calendar sync failed: {meeting.calendarSyncError}</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                {meeting.meetingLink && (
                  <>
                    <Button asChild size="sm" variant="outline">
                      <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                        <Video className="size-3.5" />
                        Join
                      </a>
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void copyLink(meeting.meetingLink!)}>
                      <Copy className="size-3.5" />
                      Copy link
                    </Button>
                  </>
                )}
                {meeting.status === "SCHEDULED" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive ml-auto"
                    disabled={cancelMeeting.isPending}
                    onClick={() => cancelMeeting.mutate(meeting.id)}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <MeetingFormDialog open={dialogOpen} onOpenChange={setDialogOpen} lead={lead} />
    </div>
  )
}
