import { useState } from "react"

import type { LeadDto } from "@/domains/leads/domain/types"
import { useUserNames } from "@/domains/user-management/presentation/hooks/use-users"
import { Button } from "@/shared/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

import { useScheduleMeeting } from "../hooks/use-meetings"


interface MeetingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lead: LeadDto
}

const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"

export function MeetingFormDialog({ open, onOpenChange, lead }: MeetingFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && <MeetingFormFields key={lead.id} lead={lead} onOpenChange={onOpenChange} />}
    </Dialog>
  )
}

function MeetingFormFields({ lead, onOpenChange }: { lead: LeadDto; onOpenChange: (open: boolean) => void }) {
  const { data: userNames } = useUserNames()
  const scheduleMeeting = useScheduleMeeting()

  const [title, setTitle] = useState("")
  const [agenda, setAgenda] = useState("")
  const [scheduledAt, setScheduledAt] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("60")
  const [assignedUserId, setAssignedUserId] = useState(lead.assignedTo ?? "")

  const submit = async () => {
    if (!scheduledAt) return
    await scheduleMeeting.mutateAsync({
      leadId: lead.id,
      data: {
        title: title.trim() || undefined,
        agenda: agenda.trim() || undefined,
        scheduledAt: `${scheduledAt}:00`,
        durationMinutes: Number(durationMinutes) || 60,
        timezone: DEFAULT_TIMEZONE,
        assignedUserId: assignedUserId || undefined
      }
    })
    onOpenChange(false)
  }

  const assignee = userNames?.find(user => user.id === assignedUserId)

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Generate a meeting link</DialogTitle>
        <DialogDescription>
          Creates a Google Calendar event with a Meet link and reminders 1h, 10m and 2m before.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder={`Meeting with ${[lead.firstName, lead.lastName].filter(Boolean).join(" ") || "lead"}`}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Agenda</Label>
            <Textarea rows={3} value={agenda} onChange={event => setAgenda(event.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Date &amp; time</Label>
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={event => setScheduledAt(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input
                type="number"
                min={15}
                step={15}
                value={durationMinutes}
                onChange={event => setDurationMinutes(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assign to</Label>
            <Select value={assignedUserId} onValueChange={setAssignedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Platform user handling this deal" />
              </SelectTrigger>
              <SelectContent>
                {userNames?.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {assignee && <p className="text-muted-foreground text-xs">Invite and reminders go to this user.</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!scheduledAt || scheduleMeeting.isPending} onClick={submit}>
            Generate link
          </Button>
        </DialogFooter>
    </DialogContent>
  )
}
