import { useEffect } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
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

import { useCatalog, useCreateRole, useUpdateRole } from "../hooks/use-roles"

import { PermissionMatrix } from "./permission-matrix"

import type { RoleResponse } from "../../domain/types"

const roleSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  permissions: z.array(z.string())
})

type RoleFormValues = z.infer<typeof roleSchema>

const defaults: RoleFormValues = { name: "", permissions: [] }

interface RoleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role?: RoleResponse | null
}

/** `isSystem` roles render fully read-only - RoleServiceImpl refuses an update/delete on one with
 *  a 403 regardless of what this dialog does, so there is nothing here worth letting the user
 *  attempt. */
export function RoleFormDialog({ open, onOpenChange, role }: RoleFormDialogProps) {
  const isEdit = Boolean(role?.id)
  const readOnly = Boolean(role?.isSystem)

  const { data: catalog, isLoading: catalogLoading } = useCatalog()

  const form = useForm<RoleFormValues>({ resolver: zodResolver(roleSchema), defaultValues: defaults })
  const permissions = form.watch("permissions")

  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const isSubmitting = createRole.isPending || updateRole.isPending

  useEffect(() => {
    if (!open) return
    form.reset(role ? { name: role.name, permissions: role.permissions } : defaults)
  }, [open, role, form])

  const onSubmit = async (values: RoleFormValues) => {
    if (readOnly) return
    try {
      if (role?.id) {
        await updateRole.mutateAsync({ id: role.id, data: values })
      } else {
        await createRole.mutateAsync(values)
      }
      onOpenChange(false)
    } catch {
      // Toasted centrally; the dialog stays open on a duplicate name so the user can change it.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{readOnly ? role?.name : isEdit ? "Edit role" : "New role"}</DialogTitle>
          <DialogDescription>
            {readOnly
              ? "System roles are seeded automatically and cannot be changed."
              : "Permissions here can only narrow what the role's Cognito group already allows, never widen it."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={readOnly} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="max-h-[50vh] overflow-y-auto rounded-md border">
                {catalogLoading || !catalog ? (
                  <p className="text-muted-foreground p-4 text-sm">Loading permissions...</p>
                ) : (
                  <PermissionMatrix
                    catalog={catalog}
                    permissions={permissions}
                    onChange={next => form.setValue("permissions", next, { shouldDirty: true })}
                    readOnly={readOnly}
                  />
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {readOnly ? "Close" : "Cancel"}
              </Button>
              {!readOnly && (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create role"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
