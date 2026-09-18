import { useMemo, useState } from "react"

import { KeyRound, MoreHorizontal, Pencil, Trash2, UserCog } from "lucide-react"

import { useMe } from "@/domains/authorization/presentation/hooks/use-authorization-queries"
import { useRoles } from "@/domains/role-management/presentation/hooks/use-roles"
import { formatDate, titleCase } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { DataTable, sortingToApiFormat } from "@/shared/ui/common/data-table"
import type { ColumnDef, SearchFilter } from "@/shared/ui/common/data-table"
import { KpiCard, KpiSection } from "@/shared/ui/common/kpi-section"
import { usePermission } from "@/shared/ui/common/require-permission"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"
import { Page, PageHeader } from "@/shared/ui/layout/pages"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"
import { Switch } from "@/shared/ui/switch"

import { useUsersFilterStore, type UsersFilters } from "../../application/store/users-filter.store"
import { userPolicy } from "../../domain/user-policy"
import { toUserSearchFields } from "../../infrastructure/api/users.service"
import { ResetPasswordDialog } from "../components/reset-password-dialog"
import { UserFormDialog } from "../components/user-form-dialog"
import { useDeleteUser, useSetUserStatus, useUsersPaginated } from "../hooks/use-users"

import type { UserDto } from "../../domain/types"

const SEARCH_SCOPES: SearchFilter[] = [
  { id: "email", displayName: "Email" },
  { id: "firstName", displayName: "First name" },
  { id: "lastName", displayName: "Last name" }
]

const ANY = "__any__"

const USER_ROLES = ["TENANT_ADMIN", "TENANT_USER", "PLATFORM_ADMIN", "PLATFORM_USER"] as const

type DraftFilters = Pick<UsersFilters, "enabled" | "role" | "customRoleId">

const emptyDraft: DraftFilters = { enabled: undefined, role: undefined, customRoleId: undefined }

export default function UsersPage() {
  const { filters, pagination, sorting, setFilters, setPagination, setSorting, resetFilters } = useUsersFilterStore()

  // The drawer edits a draft, and only Apply commits it to the store - editing the live filters
  // would refetch the list on every dropdown change while the drawer is still open.
  const [draft, setDraft] = useState<DraftFilters>({
    enabled: filters.enabled,
    role: filters.role,
    customRoleId: filters.customRoleId
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<UserDto | null>(null)
  const [resetTarget, setResetTarget] = useState<UserDto | null>(null)

  const { data: me } = useMe()
  const { hasPermission } = usePermission()
  const { data: roles } = useRoles()
  const deleteUser = useDeleteUser()
  const setStatus = useSetUserStatus()
  const currentUserId = me?.id ?? ""

  const { data: page, isFetching } = useUsersPaginated({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortingToApiFormat(sorting),
    q: filters.search || undefined,
    searchFields: toUserSearchFields(filters.searchFields),
    enabled: filters.enabled,
    role: filters.role,
    customRoleId: filters.customRoleId
  })

  const handleDelete = async (user: UserDto) => {
    if (!window.confirm(`Delete user ${user.displayName}?`)) return
    await deleteUser.mutateAsync(user.id).catch(() => undefined)
  }

  const hasActiveFilters = filters.enabled !== undefined || Boolean(filters.role) || Boolean(filters.customRoleId)

  const clearFilters = () => {
    setDraft(emptyDraft)
    resetFilters()
  }

  const columns = useMemo<ColumnDef<UserDto, unknown>[]>(
    () => [
      {
        id: "displayName",
        accessorKey: "displayName",
        header: "Name",
        meta: { label: "Name" },
        cell: ({ row }) => <span className="font-medium">{row.original.displayName || row.original.email}</span>
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email" }
      },
      {
        id: "role",
        accessorKey: "role",
        header: "Role",
        meta: { label: "Role" },
        cell: ({ row }) => <Badge variant="secondary">{titleCase(row.original.role)}</Badge>
      },
      {
        id: "customRoleId",
        header: "Custom role",
        meta: { label: "Custom role" },
        enableSorting: false,
        cell: ({ row }) => roles?.find(role => role.id === row.original.customRoleId)?.name ?? "-"
      },
      {
        id: "enabled",
        header: "Status",
        meta: { label: "Status" },
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original
          const check = userPolicy.canChangeStatus(user, currentUserId)
          const disabled = !hasPermission("toggle", "users") || !check.allowed || setStatus.isPending
          return (
            <Switch
              checked={user.enabled}
              disabled={disabled}
              title={check.reason}
              onCheckedChange={enabled => setStatus.mutate({ id: user.id, enabled })}
            />
          )
        }
      },
      {
        id: "created",
        accessorKey: "created",
        header: "Created",
        meta: { label: "Created" },
        cell: ({ row }) => formatDate(row.original.created)
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const user = row.original
          const deleteCheck = userPolicy.canDelete(user, currentUserId)
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Row actions"
                  onClick={event => event.stopPropagation()}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={event => event.stopPropagation()}>
                {hasPermission("update", "users") && (
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(user)
                      setFormOpen(true)
                    }}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </DropdownMenuItem>
                )}
                {hasPermission("update", "users") && (
                  <DropdownMenuItem onClick={() => setResetTarget(user)}>
                    <KeyRound className="size-3.5" />
                    Reset password
                  </DropdownMenuItem>
                )}
                {hasPermission("delete", "users") && (
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={!deleteCheck.allowed}
                    title={deleteCheck.reason}
                    onClick={() => handleDelete(user)}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentUserId, roles]
  )

  return (
    <Page>
      <PageHeader Icon={UserCog} title="Users" subtitle="Who can sign in, and what they can do." />

      <KpiSection className="mt-4">
        <KpiCard label="Total users" value={page?.totalElements ?? 0} Icon={UserCog} isLoading={isFetching && !page} />
      </KpiSection>

      <DataTable
        columns={columns}
        data={page?.content ?? []}
        getRowId={user => user.id}
        isLoading={isFetching}
        totalElements={page?.totalElements}
        pageCount={page?.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={filters.search}
        onGlobalFilterChange={(search, searchFields) => setFilters({ search, searchFields: searchFields ?? "" })}
        availableSearchFilters={SEARCH_SCOPES}
        columnVisibility={filters.columnVisibility}
        onColumnVisibilityChange={updater =>
          setFilters({
            columnVisibility: typeof updater === "function" ? updater(filters.columnVisibility ?? {}) : updater
          })
        }
        lockedColumns={["displayName", "actions"]}
        // Lets the ai-sdk widget attach to a user row, matching the leads table's own convention.
        getRowDataAttributes={user => ({ "data-ai-sdk-entity": "User", "data-ai-sdk-id": user.id })}
        hasActiveFilters={hasActiveFilters}
        filterContent={
          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={draft.enabled === undefined ? ANY : draft.enabled ? "enabled" : "disabled"}
                onValueChange={value =>
                  setDraft(prev => ({ ...prev, enabled: value === ANY ? undefined : value === "enabled" }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  <SelectItem value="enabled">Active</SelectItem>
                  <SelectItem value="disabled">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select
                value={draft.role ?? ANY}
                onValueChange={value => setDraft(prev => ({ ...prev, role: value === ANY ? undefined : value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {USER_ROLES.map(role => (
                    <SelectItem key={role} value={role}>
                      {titleCase(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Custom role</label>
              <Select
                value={draft.customRoleId ?? ANY}
                onValueChange={value =>
                  setDraft(prev => ({ ...prev, customRoleId: value === ANY ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any</SelectItem>
                  {roles?.map(role => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        }
        filterActions={
          hasActiveFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          ) : null
        }
        onFilterSearch={() => setFilters(draft)}
        onFilterReset={clearFilters}
        config={{
          showFilter: true,
          addButton: hasPermission("add", "users")
            ? {
                label: "New user",
                onClick: () => {
                  setEditing(null)
                  setFormOpen(true)
                }
              }
            : undefined
        }}
      />

      <UserFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        user={editing}
      />

      <ResetPasswordDialog open={Boolean(resetTarget)} onOpenChange={open => !open && setResetTarget(null)} user={resetTarget} />
    </Page>
  )
}
