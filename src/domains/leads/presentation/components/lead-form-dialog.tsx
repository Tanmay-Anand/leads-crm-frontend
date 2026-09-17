import { useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useChannelPartnerNames } from "@/domains/channel-partners/presentation/hooks/use-channel-partners"
import { useProjectNames } from "@/domains/project/presentation/hooks/use-projects"
import { Button } from "@/shared/ui/button"
import { Checkbox } from "@/shared/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

import { leadFormDefaults, leadFormSchema, type LeadFormValues } from "../../domain/lead.schemas"
import type { CreateLeadRequest, LeadDto } from "../../domain/types"
import {
  useCreateLead,
  useLeadStatuses,
  useSourceCategories,
  useSourceTypes,
  useTags,
  useTemperatures,
  useUpdateLead
} from "../hooks/use-leads"

const PROPERTY_CATEGORIES: LeadFormValues["propertyCategory"][] = [
  "RESIDENTIAL",
  "COMMERCIAL",
  "PLOT",
  "AGRICULTURE"
]

const PURCHASE_TIMELINES = [
  "IMMEDIATE",
  "ONE_MONTH",
  "THREE_MONTHS",
  "SIX_MONTHS",
  "ONE_YEAR",
  "EXPLORING"
] as const

/** Sentinel for "no selection" in a Select, which cannot hold an empty string as a value. */
const NONE = "__none__"

interface LeadFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when creating. */
  lead?: LeadDto | null
}

export function LeadFormDialog({ open, onOpenChange, lead }: LeadFormDialogProps) {
  const isEdit = Boolean(lead)

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: leadFormDefaults
  })

  const { data: statuses } = useLeadStatuses()
  const { data: temperatures } = useTemperatures()
  const { data: tags } = useTags()
  const { data: sourceCategories } = useSourceCategories()
  const { data: projects } = useProjectNames()
  const { data: partners } = useChannelPartnerNames()

  const sourceCategoryId = form.watch("sourceCategoryId")
  // Types are scoped to the chosen category, so the second dropdown refetches when the first changes.
  const { data: sourceTypes } = useSourceTypes(sourceCategoryId)

  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const isSubmitting = createLead.isPending || updateLead.isPending

  // Reset on open rather than on mount: the dialog stays mounted between openings, so without
  // this an edit would show whatever the last one left behind.
  useEffect(() => {
    if (!open) return

    if (lead) {
      form.reset({
        firstName: lead.firstName ?? "",
        lastName: lead.lastName ?? "",
        mobile: lead.mobile ?? "",
        countryCode: lead.countryCode ?? "+91",
        alternateMobile: lead.alternateMobile ?? "",
        email: lead.email ?? "",
        occupation: lead.occupation ?? "",
        city: lead.address?.city ?? "",
        state: lead.address?.state ?? "",
        propertyCategory: lead.propertyCategory ?? "RESIDENTIAL",
        purchaseTimeline: lead.purchaseTimeline ?? undefined,
        projectId: lead.projectId ?? undefined,
        channelPartnerId: lead.channelPartnerId ?? undefined,
        statusId: lead.status?.id ?? undefined,
        temperatureId: lead.temperature?.id ?? undefined,
        sourceCategoryId: lead.sourceCategory?.id ?? undefined,
        sourceTypeId: lead.sourceType?.id ?? undefined,
        tagIds: lead.tags?.map(tag => tag.id) ?? [],
        assignedToUserName: lead.assignedToName ?? "",
        scheduleDate: lead.scheduleDate ? lead.scheduleDate.slice(0, 16) : "",
        notes: lead.notes ?? "",
        isNri: lead.isNri,
        isDraft: lead.isDraft
      })
    } else {
      form.reset(leadFormDefaults)
    }
  }, [open, lead, form])

  const toRequest = (values: LeadFormValues): CreateLeadRequest => ({
    firstName: values.firstName,
    lastName: values.lastName || undefined,
    mobile: values.mobile,
    countryCode: values.countryCode || undefined,
    alternateMobile: values.alternateMobile || undefined,
    email: values.email || undefined,
    occupation: values.occupation || undefined,
    address:
      values.city || values.state
        ? { city: values.city || undefined, state: values.state || undefined }
        : undefined,
    propertyCategory: values.propertyCategory,
    purchaseTimeline: values.purchaseTimeline,
    projectId: values.projectId ?? null,
    channelPartnerId: values.channelPartnerId ?? null,
    statusId: values.statusId ?? null,
    temperatureId: values.temperatureId ?? null,
    sourceCategoryId: values.sourceCategoryId ?? null,
    sourceTypeId: values.sourceTypeId ?? null,
    tagIds: values.tagIds ?? [],
    assignedToUserName: values.assignedToUserName || null,
    // datetime-local gives minutes only; the API wants seconds.
    scheduleDate: values.scheduleDate ? `${values.scheduleDate}:00` : null,
    notes: values.notes || undefined,
    isNri: values.isNri,
    isDraft: values.isDraft
  })

  const onSubmit = async (values: LeadFormValues) => {
    const request = toRequest(values)
    try {
      if (lead) {
        await updateLead.mutateAsync({ id: lead.id, data: request })
      } else {
        await createLead.mutateAsync(request)
      }
      onOpenChange(false)
    } catch {
      // The mutation cache already toasted. Swallowed so the dialog stays open on the values the
      // user still needs to fix, most often a duplicate mobile.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit lead" : "New lead"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of this lead."
              : "Capture a new enquiry. A lead is unique per project and mobile number."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ravi" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Kumar" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="9876543210" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="ravi@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="propertyCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseTimeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase timeline</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Not set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Not set</SelectItem>
                        {PURCHASE_TIMELINES.map(timeline => (
                          <SelectItem key={timeline} value={timeline}>
                            {timeline.replaceAll("_", " ").toLowerCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>No project</SelectItem>
                        {projects?.map(project => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="channelPartnerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel partner</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Direct" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Direct</SelectItem>
                        {partners?.map(partner => (
                          <SelectItem key={partner.id} value={partner.id}>
                            {partner.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="statusId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Default status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Default status</SelectItem>
                        {statuses?.map(status => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.displayName ?? status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="temperatureId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Not set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Not set</SelectItem>
                        {temperatures?.map(temperature => (
                          <SelectItem key={temperature.id} value={temperature.id}>
                            {temperature.displayName ?? temperature.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceCategoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source category</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => {
                        field.onChange(value === NONE ? undefined : value)
                        // The chosen type belongs to the old category, so it cannot survive the change.
                        form.setValue("sourceTypeId", undefined)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Not set" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Not set</SelectItem>
                        {sourceCategories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.displayName ?? category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sourceTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source type</FormLabel>
                    <Select
                      value={field.value ?? NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                      disabled={!sourceCategoryId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={sourceCategoryId ? "Not set" : "Pick a category first"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>Not set</SelectItem>
                        {sourceTypes?.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.displayName ?? type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hyderabad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Telangana" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedToUserName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Sales rep name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next follow-up</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tagIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-3 rounded-md border p-3">
                    {!tags || tags.length === 0 ? (
                      <span className="text-muted-foreground text-sm">No tags configured.</span>
                    ) : (
                      tags.map(tag => {
                        const selected = field.value?.includes(tag.id) ?? false
                        return (
                          <label key={tag.id} className="flex cursor-pointer items-center gap-1.5 text-sm">
                            <Checkbox
                              checked={selected}
                              onCheckedChange={checked => {
                                const current = field.value ?? []
                                field.onChange(
                                  checked ? [...current, tag.id] : current.filter(id => id !== tag.id)
                                )
                              }}
                            />
                            {tag.displayName ?? tag.name}
                          </label>
                        )
                      })
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Interested in a 2BHK facing the park" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6">
              <FormField
                control={form.control}
                name="isNri"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={value => field.onChange(Boolean(value))} />
                    </FormControl>
                    <FormLabel className="!mt-0">NRI</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDraft"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center gap-2">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={value => field.onChange(Boolean(value))} />
                    </FormControl>
                    <FormLabel className="!mt-0">Save as draft</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create lead"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
