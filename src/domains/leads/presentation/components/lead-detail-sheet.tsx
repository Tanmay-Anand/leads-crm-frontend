import { useState } from "react"

import { Pencil, Plus } from "lucide-react"

import { formatDate, titleCase } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Separator } from "@/shared/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/shared/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs"
import { Textarea } from "@/shared/ui/textarea"

import type { LeadDto, LeadNoteType } from "../../domain/types"
import { useAddLeadNote, useLead, useLeadNotes, useLeadStatuses, useUpdateLeadStatus } from "../hooks/use-leads"

const NOTE_TYPES: LeadNoteType[] = ["NOTE", "CALL", "WHATSAPP", "EMAIL", "SITE_VISIT", "DOCUMENT_LINK"]

interface LeadDetailSheetProps {
  lead: LeadDto | null
  onOpenChange: (open: boolean) => void
  onEdit: (lead: LeadDto) => void
}

export function LeadDetailSheet({ lead, onOpenChange, onEdit }: LeadDetailSheetProps) {
  // Refetched by id rather than trusting the row: the list row is a page snapshot and may be
  // stale by the time the sheet opens.
  const { data: detail } = useLead(lead?.id)
  const current = detail ?? lead

  const { data: notes } = useLeadNotes(lead?.id)
  const { data: statuses } = useLeadStatuses()
  const updateStatus = useUpdateLeadStatus()
  const addNote = useAddLeadNote()

  const [noteBody, setNoteBody] = useState("")
  const [noteType, setNoteType] = useState<LeadNoteType>("NOTE")
  const [statusNote, setStatusNote] = useState("")
  const [pendingStatusId, setPendingStatusId] = useState<string | null>(null)

  const pendingStatus = statuses?.find(status => status.id === pendingStatusId)
  const noteRequired = pendingStatus?.isNoteRequired ?? false

  const handleStatusChange = async (statusId: string) => {
    const target = statuses?.find(status => status.id === statusId)

    // A status that demands a note cannot be applied straight from the dropdown, so the selection
    // is held until the note is typed. The server enforces the same rule.
    if (target?.isNoteRequired) {
      setPendingStatusId(statusId)
      return
    }

    if (!current) return
    await updateStatus.mutateAsync({ id: current.id, data: { statusId } })
  }

  const applyPendingStatus = async () => {
    if (!current || !pendingStatusId) return
    await updateStatus.mutateAsync({
      id: current.id,
      data: { statusId: pendingStatusId, note: statusNote }
    })
    setPendingStatusId(null)
    setStatusNote("")
  }

  const submitNote = async () => {
    if (!current || !noteBody.trim()) return
    await addNote.mutateAsync({ leadId: current.id, data: { type: noteType, body: noteBody.trim() } })
    setNoteBody("")
  }

  if (!current) return null

  const fullName = [current.firstName, current.lastName].filter(Boolean).join(" ") || "Lead"

  return (
    <Sheet open={Boolean(lead)} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle>{fullName}</SheetTitle>
              <SheetDescription>
                {current.leadCode ?? "No code"} &middot; {current.mobile}
              </SheetDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onEdit(current)}>
              <Pencil className="size-3.5" />
              Edit
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col px-4">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="min-h-0 flex-1 space-y-4 overflow-y-auto pt-4">
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-medium">Status</label>
              <Select value={current.status?.id ?? ""} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue placeholder="No status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses?.map(status => (
                    <SelectItem key={status.id} value={status.id}>
                      {status.displayName ?? status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {noteRequired && pendingStatusId && (
                <div className="bg-muted/40 space-y-2 rounded-md border p-3">
                  <p className="text-xs">
                    Moving to <strong>{pendingStatus?.displayName ?? pendingStatus?.name}</strong> requires a note.
                  </p>
                  <Textarea
                    rows={2}
                    value={statusNote}
                    onChange={event => setStatusNote(event.target.value)}
                    placeholder="Why is the lead moving to this status?"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPendingStatusId(null)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      disabled={!statusNote.trim() || updateStatus.isPending}
                      onClick={applyPendingStatus}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Field label="Email" value={current.email} />
              <Field label="Occupation" value={current.occupation} />
              <Field label="Category" value={titleCase(current.propertyCategory)} />
              <Field label="Timeline" value={titleCase(current.purchaseTimeline)} />
              <Field label="Temperature" value={current.temperature?.displayName ?? current.temperature?.name} />
              <Field label="Owner" value={current.assignedToName ?? "Unassigned"} />
              <Field label="Channel partner" value={current.channelPartnerName} />
              <Field label="Source" value={current.sourceType?.displayName ?? current.sourceCategory?.displayName} />
              <Field label="City" value={current.address?.city} />
              <Field label="State" value={current.address?.state} />
              <Field label="NRI" value={current.isNri ? "Yes" : "No"} />
              <Field label="Follow-up" value={formatDate(current.scheduleDate, true)} />
              <Field label="Created" value={formatDate(current.createdOn, true)} />
              <Field label="Created by" value={current.createdBy} />
            </dl>

            {current.tags && current.tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1.5">
                  {current.tags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={tag.colorCode ? { borderColor: tag.colorCode, color: tag.colorCode } : undefined}
                    >
                      {tag.displayName ?? tag.name}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {current.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground mb-1 text-xs font-medium">Notes</p>
                  <p className="text-sm whitespace-pre-wrap">{current.notes}</p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="activity" className="min-h-0 flex-1 space-y-3 overflow-y-auto pt-4">
            <div className="space-y-2 rounded-md border p-3">
              <div className="flex gap-2">
                <Select value={noteType} onValueChange={value => setNoteType(value as LeadNoteType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {titleCase(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={noteBody}
                  onChange={event => setNoteBody(event.target.value)}
                  placeholder="Add an activity note"
                  onKeyDown={event => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      void submitNote()
                    }
                  }}
                />
                <Button size="icon" disabled={!noteBody.trim() || addNote.isPending} onClick={submitNote}>
                  <Plus className="size-4" />
                </Button>
              </div>
            </div>

            {!notes || notes.content.length === 0 ? (
              <p className="text-muted-foreground py-6 text-center text-sm">No activity recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {notes.content.map(note => (
                  <li key={note.id} className="rounded-md border p-3">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <Badge variant="secondary">{titleCase(note.type)}</Badge>
                      <span className="text-muted-foreground text-xs">{formatDate(note.createdOn, true)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.body}</p>
                    {note.performedByUsername && (
                      <p className="text-muted-foreground mt-1 text-xs">by {note.performedByUsername}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="truncate">{value && value !== "-" ? value : "-"}</dd>
    </div>
  )
}
