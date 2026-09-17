import { useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, type Control } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/shared/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Textarea } from "@/shared/ui/textarea"

import type { ProjectDto } from "../../domain/types"
import { useCreateProject, useUpdateProject } from "../hooks/use-projects"

const PROJECT_STAGES = ["PLANNING", "PRE_LAUNCH", "LAUNCHED", "DELIVERED"] as const
const PROJECT_TYPES = ["RESIDENTIAL_APARTMENT", "RESIDENTIAL_VILLA", "COMMERCIAL", "MIXED_USE"] as const
const AREA_UNITS = ["SQM", "SQFT", "ACRES", "HECTARES"] as const
const REGIONS = ["INDIA", "DUBAI"] as const
const SAVE_STATUSES = ["DRAFT", "COMPLETED"] as const

const NONE = "__none__"

/**
 * Only name is required, matching the backend.
 *
 * A project is set up over several sessions in the real wizard, so demanding a complete record up
 * front would block the first save; saveStatus is what says whether it is finished.
 */
const projectFormSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  brand: z.string().trim().optional(),
  legalEntity: z.string().trim().optional(),
  projectStage: z.enum(PROJECT_STAGES).optional(),
  projectType: z.enum(PROJECT_TYPES).optional(),
  region: z.enum(REGIONS).optional(),
  saveStatus: z.enum(SAVE_STATUSES).optional(),
  startDate: z.string().optional(),
  expectedCompletionDate: z.string().optional(),
  reraNumber: z.string().trim().optional(),
  reraState: z.string().trim().optional(),
  microMarket: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  totalLandArea: z.string().optional(),
  areaUnit: z.enum(AREA_UNITS).optional(),
  description: z.string().trim().optional()
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

const defaults: ProjectFormValues = {
  name: "",
  brand: "",
  legalEntity: "",
  projectStage: undefined,
  projectType: undefined,
  region: "INDIA",
  saveStatus: "DRAFT",
  startDate: "",
  expectedCompletionDate: "",
  reraNumber: "",
  reraState: "",
  microMarket: "",
  city: "",
  state: "",
  totalLandArea: "",
  areaUnit: undefined,
  description: ""
}

interface ProjectFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project?: ProjectDto | null
}

export function ProjectFormDialog({ open, onOpenChange, project }: ProjectFormDialogProps) {
  const isEdit = Boolean(project?.id)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaults
  })

  const createProject = useCreateProject()
  const updateProject = useUpdateProject()
  const isSubmitting = createProject.isPending || updateProject.isPending

  useEffect(() => {
    if (!open) return

    if (project) {
      form.reset({
        name: project.name,
        brand: project.brand ?? "",
        legalEntity: project.legalEntity ?? "",
        projectStage: project.projectStage ?? undefined,
        projectType: project.projectType ?? undefined,
        region: project.region ?? "INDIA",
        saveStatus: project.saveStatus ?? "DRAFT",
        startDate: project.startDate ?? "",
        expectedCompletionDate: project.expectedCompletionDate ?? "",
        reraNumber: project.reraNumber ?? "",
        reraState: project.reraState ?? "",
        microMarket: project.microMarket ?? "",
        city: project.address?.city ?? "",
        state: project.address?.state ?? "",
        totalLandArea: project.totalLandArea != null ? String(project.totalLandArea) : "",
        areaUnit: project.areaUnit ?? undefined,
        description: project.description ?? ""
      })
    } else {
      form.reset(defaults)
    }
  }, [open, project, form])

  const onSubmit = async (values: ProjectFormValues) => {
    const request: ProjectDto = {
      name: values.name,
      brand: values.brand || null,
      legalEntity: values.legalEntity || null,
      projectStage: values.projectStage ?? null,
      projectType: values.projectType ?? null,
      region: values.region ?? null,
      saveStatus: values.saveStatus ?? "DRAFT",
      startDate: values.startDate || null,
      expectedCompletionDate: values.expectedCompletionDate || null,
      reraNumber: values.reraNumber || null,
      reraState: values.reraState || null,
      microMarket: values.microMarket || null,
      address:
        values.city || values.state
          ? { city: values.city || null, state: values.state || null }
          : null,
      totalLandArea: values.totalLandArea ? Number(values.totalLandArea) : null,
      areaUnit: values.areaUnit ?? null,
      description: values.description || null
    }

    try {
      if (project?.id) {
        await updateProject.mutateAsync({ id: project.id, data: request })
      } else {
        await createProject.mutateAsync(request)
      }
      onOpenChange(false)
    } catch {
      // Toasted centrally; the dialog stays open on a duplicate name so the user can change it.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit project" : "New project"}</DialogTitle>
          <DialogDescription>
            Only the name is required. Save as a draft and finish the details later.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Project name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Skyline Residences" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Skyline Group" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="legalEntity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legal entity</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Skyline Developers Pvt Ltd" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EnumField control={form.control} name="projectStage" label="Stage" options={PROJECT_STAGES} />
              <EnumField control={form.control} name="projectType" label="Type" options={PROJECT_TYPES} />
              <EnumField control={form.control} name="region" label="Region" options={REGIONS} />
              <EnumField control={form.control} name="saveStatus" label="Setup status" options={SAVE_STATUSES} />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedCompletionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expected completion</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reraNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RERA number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="P02400001234" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reraState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RERA state</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Telangana" />
                    </FormControl>
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
                name="microMarket"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Micro market</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Gachibowli" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="totalLandArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total land area</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" step="0.01" placeholder="12.5" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <EnumField control={form.control} name="areaUnit" label="Area unit" options={AREA_UNITS} />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Two towers, 3 and 4 BHK, ready by 2028." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * A Select over a fixed enum, with an explicit "not set" entry.
 *
 * Extracted because six of these in one form is otherwise sixty lines of identical JSX. Radix
 * Select cannot hold an empty string as a value, hence the sentinel.
 */
function EnumField({
  control,
  name,
  label,
  options
}: {
  control: Control<ProjectFormValues>
  name: keyof ProjectFormValues
  label: string
  options: readonly string[]
}) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            value={(field.value as string) || NONE}
            onValueChange={value => field.onChange(value === NONE ? undefined : value)}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Not set" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              {options.map(option => (
                <SelectItem key={option} value={option}>
                  {option.replaceAll("_", " ").toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
