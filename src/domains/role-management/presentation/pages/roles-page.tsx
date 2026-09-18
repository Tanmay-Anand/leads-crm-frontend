import { useState } from "react"

import { Plus, ShieldCheck } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { RequirePermission } from "@/shared/ui/common/require-permission"
import { Page, PageHeader } from "@/shared/ui/layout/pages"

import { RoleCard } from "../components/role-card"
import { RoleFormDialog } from "../components/role-form-dialog"
import { useDeleteRole, useRoles } from "../hooks/use-roles"

import type { RoleResponse } from "../../domain/types"

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles()
  const deleteRole = useDeleteRole()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<RoleResponse | null>(null)

  const handleDelete = async (role: RoleResponse) => {
    if (!window.confirm(`Delete role ${role.name}?`)) return
    await deleteRole.mutateAsync(role.id).catch(() => undefined)
  }

  return (
    <Page>
      <PageHeader
        Icon={ShieldCheck}
        title="Roles & Permissions"
        subtitle="Custom roles can only narrow what a user's Cognito group already allows."
        cta={
          <RequirePermission action="add" resource="roles">
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="size-3.5" />
              New role
            </Button>
          </RequirePermission>
        }
      />

      {isLoading ? (
        <p className="text-muted-foreground mt-4 text-sm">Loading roles...</p>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles?.map(role => (
            <RoleCard
              key={role.id}
              role={role}
              onView={selected => {
                setEditing(selected)
                setFormOpen(true)
              }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <RoleFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        role={editing}
      />
    </Page>
  )
}
