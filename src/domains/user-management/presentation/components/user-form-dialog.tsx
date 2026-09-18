import { useEffect, useMemo } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { UserRole } from "@/domains/authentication/domain/types"
import { useMe } from "@/domains/authorization/presentation/hooks/use-authorization-queries"
import { useRoles } from "@/domains/role-management/presentation/hooks/use-roles"
import { Button } from "@/shared/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form"
import { Input } from "@/shared/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/shared/ui/sheet"

import { isPlatformRole } from "../../domain/user-policy"
import { useCreateUser, useUpdateUser } from "../hooks/use-users"

import type { UserDto } from "../../domain/types"
import type { Resolver } from "react-hook-form"

const ALL_ROLES: UserRole[] = ["TENANT_ADMIN", "TENANT_USER", "PLATFORM_ADMIN", "PLATFORM_USER"]
const NONE = "__none__"

/**
 * Two schemas, not one - the reference's `zPassword.optional().or(z.literal(""))` on the update
 * form means a stray keystroke silently rotates a colleague's password. This form never renders a
 * password field when editing; password reset is a separate, explicitly gated row action (see
 * reset-password-dialog.tsx). `customRoleId` is always rendered and always submitted (never
 * conditionally hidden), so a role switch cannot leave react-hook-form holding a stale value for
 * a field the user never saw.
 */
const baseFields = {
  email: z.string().trim().email({ message: "A valid email is required" }),
  firstName: z.string().trim().optional(),
  lastName: z.string().trim().optional(),
  role: z.enum(["TENANT_ADMIN", "TENANT_USER", "PLATFORM_ADMIN", "PLATFORM_USER"]),
  customRoleId: z.string().optional()
}

const createSchema = z.object({ ...baseFields, password: z.string().min(8, { message: "At least 8 characters" }) })
const editSchema = z.object({ ...baseFields, password: z.string().optional() })

type FormValues = z.infer<typeof createSchema>

const defaults: FormValues = {
  email: "",
  firstName: "",
  lastName: "",
  role: "TENANT_USER",
  customRoleId: undefined,
  password: ""
}

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: UserDto | null
}

export function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEdit = Boolean(user?.id)

  const { data: me } = useMe()
  const { data: roles } = useRoles()
  const callerIsPlatformAdmin = me?.role === "PLATFORM_ADMIN"

  const form = useForm<FormValues>({
    // Both schemas produce a Resolver<FormValues> at runtime - they only differ in whether
    // `password` is required - but zodResolver infers each call's generic from its own literal
    // schema argument, so TS sees two incompatible resolver types across the ternary's branches.
    resolver: (isEdit ? zodResolver(editSchema) : zodResolver(createSchema)) as Resolver<FormValues>,
    defaultValues: defaults
  })

  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const isSubmitting = createUser.isPending || updateUser.isPending

  useEffect(() => {
    if (!open) return

    if (user) {
      form.reset({
        email: user.email,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        role: user.role,
        customRoleId: user.customRoleId ?? undefined,
        password: ""
      })
    } else {
      form.reset(defaults)
    }
  }, [open, user, form])

  // Backend re-enforces this regardless (only a platform admin may assign a platform role) - this
  // just keeps a non-platform-admin from picking an option that would only bounce with a 403.
  const roleOptions = useMemo(
    () => ALL_ROLES.filter(role => callerIsPlatformAdmin || !isPlatformRole(role)),
    [callerIsPlatformAdmin]
  )

  const onSubmit = async (values: FormValues) => {
    try {
      if (user?.id) {
        await updateUser.mutateAsync({
          id: user.id,
          data: {
            ...user,
            firstName: values.firstName || null,
            lastName: values.lastName || null,
            role: values.role,
            customRoleId: values.customRoleId || null
          }
        })
      } else {
        await createUser.mutateAsync({
          email: values.email,
          firstName: values.firstName || null,
          lastName: values.lastName || null,
          password: values.password ?? "",
          role: values.role,
          customRoleId: values.customRoleId || null
        })
      }
      onOpenChange(false)
    } catch {
      // Toasted centrally; the sheet stays open on a duplicate email so the user can change it.
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit user" : "New user"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Password is unchanged here - use "Reset password" from the row menu.'
              : "They can sign in with this email and password immediately."}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="jane@company.com" disabled={isEdit} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jane" />
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
                        <Input {...field} placeholder="Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {!isEdit && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" placeholder="At least 8 characters" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {roleOptions.map(role => (
                          <SelectItem key={role} value={role}>
                            {role.replaceAll("_", " ").toLowerCase()}
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
                name="customRoleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom role</FormLabel>
                    <Select
                      value={field.value || NONE}
                      onValueChange={value => field.onChange(value === NONE ? undefined : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="None" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NONE}>None - default permissions for the role</SelectItem>
                        {roles?.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="flex-row justify-end gap-2 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEdit ? "Save changes" : "Create user"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
