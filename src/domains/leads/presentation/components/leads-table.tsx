import { useMemo } from "react"

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { formatDate, titleCase } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { DataTable } from "@/shared/ui/common/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"

import type { ColumnDef, PaginationState, SearchFilter, SortingState, VisibilityState } from "@/shared/ui/common/data-table"
import type { LeadDto, SlaStatus } from "../../domain/types"

/** Scopes offered in the toolbar search dropdown, keyed to the service field map. */
const SEARCH_SCOPES: SearchFilter[] = [
  { id: "name", displayName: "Name" },
  { id: "leadCode", displayName: "Lead code" },
  { id: "mobile", displayName: "Mobile" },
  { id: "email", displayName: "Email" },
  { id: "assignedToName", displayName: "Owner" },
  { id: "channelPartnerName", displayName: "Channel partner" },
  { id: "status", displayName: "Status" },
  { id: "temperature", displayName: "Temperature" },
  { id: "tag", displayName: "Tag" },
  { id: "city", displayName: "City" }
]

const SLA_VARIANT: Record<SlaStatus, { label: string; className: string }> = {
  OVERDUE: { label: "Overdue", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300" },
  DUE_TODAY: {
    label: "Due today",
    className: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
  },
  ON_TRACK: {
    label: "On track",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
  }
}

interface LeadsTableProps {
  data: LeadDto[]
  isLoading?: boolean
  totalElements?: number
  pageCount?: number
  pagination: PaginationState
  onPaginationChange: (updater: (prev: PaginationState) => PaginationState) => void
  sorting: SortingState
  onSortingChange: (updater: SortingState | ((prev: SortingState) => SortingState)) => void
  globalFilter: string
  onGlobalFilterChange: (value: string, searchFields?: string) => void
  columnVisibility?: VisibilityState
  onColumnVisibilityChange?: (updater: VisibilityState | ((prev: VisibilityState) => VisibilityState)) => void
  filterContent?: React.ReactNode
  filterActions?: React.ReactNode
  hasActiveFilters?: boolean
  onFilterSearch?: () => void
  onFilterReset?: () => void
  onAdd: () => void
  onView: (lead: LeadDto) => void
  onEdit: (lead: LeadDto) => void
  onDelete: (lead: LeadDto) => void
}

export function LeadsTable({
  data,
  isLoading,
  totalElements,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  globalFilter,
  onGlobalFilterChange,
  columnVisibility,
  onColumnVisibilityChange,
  filterContent,
  filterActions,
  hasActiveFilters,
  onFilterSearch,
  onFilterReset,
  onAdd,
  onView,
  onEdit,
  onDelete
}: LeadsTableProps) {
  const columns = useMemo<ColumnDef<LeadDto, unknown>[]>(
    () => [
      {
        id: "leadCode",
        accessorKey: "leadCode",
        header: "Code",
        meta: { label: "Code" },
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.leadCode ?? "-"}</span>
      },
      {
        id: "name",
        header: "Name",
        meta: { label: "Name" },
        // Not sortable: the server sorts on a column, and the displayed name is two of them.
        enableSorting: false,
        cell: ({ row }) => {
          const { firstName, lastName } = row.original
          const name = [firstName, lastName].filter(Boolean).join(" ")
          return <span className="font-medium">{name || "-"}</span>
        }
      },
      {
        id: "mobile",
        accessorKey: "mobile",
        header: "Mobile",
        meta: { label: "Mobile" },
        cell: ({ row }) => row.original.mobile ?? "-"
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email" },
        cell: ({ row }) => row.original.email ?? "-"
      },
      {
        id: "status",
        header: "Status",
        meta: { label: "Status" },
        enableSorting: false,
        cell: ({ row }) => {
          const status = row.original.status
          if (!status) return "-"
          return (
            <Badge
              variant="outline"
              // The colour is tenant-configured, so it is applied inline rather than mapped to a
              // fixed set of classes.
              style={
                status.colorCode
                  ? { borderColor: status.colorCode, color: status.colorCode }
                  : undefined
              }
            >
              {status.displayName ?? status.name}
            </Badge>
          )
        }
      },
      {
        id: "temperature",
        header: "Temperature",
        meta: { label: "Temperature" },
        enableSorting: false,
        cell: ({ row }) => {
          const temperature = row.original.temperature
          if (!temperature) return "-"
          return (
            <span className="flex items-center gap-1.5 text-sm">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: temperature.colorCode ?? "var(--muted-foreground)" }}
              />
              {temperature.displayName ?? temperature.name}
            </span>
          )
        }
      },
      {
        id: "propertyCategory",
        accessorKey: "propertyCategory",
        header: "Category",
        meta: { label: "Category" },
        cell: ({ row }) => titleCase(row.original.propertyCategory)
      },
      {
        id: "assignedToName",
        accessorKey: "assignedToName",
        header: "Owner",
        meta: { label: "Owner" },
        cell: ({ row }) => row.original.assignedToName ?? "Unassigned"
      },
      {
        id: "channelPartnerName",
        accessorKey: "channelPartnerName",
        header: "Channel partner",
        meta: { label: "Channel partner" },
        cell: ({ row }) => row.original.channelPartnerName ?? "-"
      },
      {
        id: "slaStatus",
        header: "SLA",
        meta: { label: "SLA" },
        enableSorting: false,
        cell: ({ row }) => {
          const sla = row.original.slaStatus
          if (!sla) return "-"
          const variant = SLA_VARIANT[sla]
          return <Badge className={variant.className}>{variant.label}</Badge>
        }
      },
      {
        id: "created",
        accessorKey: "createdOn",
        header: "Created",
        meta: { label: "Created" },
        cell: ({ row }) => formatDate(row.original.createdOn)
      },
      {
        id: "actions",
        header: "",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Row actions"
                // The row itself opens the detail sheet, so the menu must not trigger it too.
                onClick={event => event.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={event => event.stopPropagation()}>
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={() => onDelete(row.original)}>
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    [onEdit, onDelete]
  )

  return (
    <DataTable
      columns={columns}
      data={data}
      getRowId={lead => lead.id}
      isLoading={isLoading}
      totalElements={totalElements}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      globalFilter={globalFilter}
      onGlobalFilterChange={onGlobalFilterChange}
      availableSearchFilters={SEARCH_SCOPES}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      lockedColumns={["leadCode", "name", "actions"]}
      filterContent={filterContent}
      filterActions={filterActions}
      hasActiveFilters={hasActiveFilters}
      onFilterSearch={onFilterSearch}
      onFilterReset={onFilterReset}
      onRowClick={onView}
      config={{
        showSearch: true,
        showFilter: true,
        showColumnVisibility: true,
        showPagination: true,
        addButton: { label: "New lead", onClick: onAdd }
      }}
    />
  )
}
