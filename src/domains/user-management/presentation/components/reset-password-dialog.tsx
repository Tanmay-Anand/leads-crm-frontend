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

import { useResetPassword } from "../hooks/use-users"

import type { UserDto } from "../../domain/types"

const schema = z.object({ password: z.string().min(8, { message: "At least 8 characters" }) })
type FormValues = z.infer<typeof schema>

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDto | null
}

/**
 * A separate, explicitly gated action rather than a field on the edit form - see
 * `user-form-dialog.tsx`'s class doc for why editing a user must never be able to rotate their
 * password as a side effect.
 */
export function ResetPasswordDialog({ open, onOpenChange, user }: ResetPasswordDialogProps) {
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { password: "" } })
  const resetPassword = useResetPassword()

  useEffect(() => {
    if (open) form.reset({ password: "" })
  }, [open, form])

  const onSubmit = async (values: FormValues) => {
    if (!user) return
    try {
      await resetPassword.mutateAsync({ id: user.id, password: values.password })
      onOpenChange(false)
    } catch {
      // Toasted centrally.
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Sets a new password for {user?.displayName ?? "this user"} immediately. They are not notified.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="At least 8 characters" autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Resetting..." : "Reset password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
