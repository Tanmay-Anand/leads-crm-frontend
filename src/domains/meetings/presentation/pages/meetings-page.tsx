import { useState } from "react"

import { CalendarClock } from "lucide-react"

import { formatDate } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Page, PageHeader } from "@/shared/ui/layout/pages"

import { useUpcomingMeetings } from "../hooks/use-meetings"

import type { MeetingStatus } from "../../domain/types"

const STATUS_VARIANT: Record<MeetingStatus, "default" | "secondary" | "destructive"> = {
  SCHEDULED: "default",
  COMPLETED: "secondary",
  CANCELLED: "destructive"
}

export default function MeetingsPage() {
  const [scope, setScope] = useState<"me" | "team">("me")
  const { data: meetings, isLoading } = useUpcomingMeetings(scope)

  return (
    <Page>
      <PageHeader
        Icon={CalendarClock}
        title="Meetings"
        subtitle="Upcoming meetings generated from leads, with reminders at 1h, 10m and 2m before."
      />

      <div className="flex gap-2">
        <Button variant={scope === "me" ? "default" : "outline"} size="sm" onClick={() => setScope("me")}>
          My meetings
        </Button>
        <Button variant={scope === "team" ? "default" : "outline"} size="sm" onClick={() => setScope("team")}>
          Team
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground py-10 text-center text-sm">Loading…</p>
      ) : !meetings || meetings.length === 0 ? (
        <p className="text-muted-foreground py-10 text-center text-sm">No upcoming meetings.</p>
      ) : (
        <ul className="space-y-2">
          {meetings.map(meeting => (
            <li key={meeting.id} className="flex items-center justify-between gap-3 rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{meeting.title ?? "Meeting"}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDate(meeting.scheduledAt, true)} &middot; {meeting.assignedUserName ?? "unassigned"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[meeting.status]}>{meeting.status}</Badge>
                {meeting.meetingLink && (
                  <Button asChild size="sm" variant="outline">
                    <a href={meeting.meetingLink} target="_blank" rel="noreferrer">
                      Join
                    </a>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Page>
  )
}
