import { Pencil, ShieldCheck, Trash2 } from "lucide-react"

import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { usePermission } from "@/shared/ui/common/require-permission"

import { rolePolicy } from "../../domain/role-policy"

import type { RoleResponse } from "../../domain/types"

interface RoleCardProps {
  role: RoleResponse
  onView: (role: RoleResponse) => void
  onDelete: (role: RoleResponse) => void
}

export function RoleCard({ role, onView, onDelete }: RoleCardProps) {
  const { hasPermission } = usePermission()
  const deleteCheck = rolePolicy.canDelete(role)

  return (
    <div className="bg-card flex flex-col gap-2 rounded-md border p-4">
      <div>
        <h3 className="flex items-center gap-1.5 font-medium">
          {role.name}
          {role.isSystem && (
            <Badge variant="secondary" className="gap-1">
              <ShieldCheck className="size-3" />
              System
            </Badge>
          )}
        </h3>
        <p className="text-muted-foreground text-xs">
          {role.userCount} user{role.userCount === 1 ? "" : "s"} · {role.permissions.length} permissions
        </p>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onView(role)}>
          <Pencil className="size-3.5" />
          {role.isSystem ? "View" : "Edit"}
        </Button>
        {!role.isSystem && hasPermission("delete", "roles") && (
          <Button
            variant="outline"
            size="sm"
            disabled={!deleteCheck.allowed}
            title={deleteCheck.reason}
            onClick={() => onDelete(role)}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
