import { useMemo, useState } from "react"

import { Award, CheckCircle2, FileEdit, Handshake, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

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


import { useChannelPartnersFilterStore } from "../../application/store/channel-partners-filter.store"
import { toChannelPartnerSearchFields } from "../../infrastructure/api/channel-partners.service"
import { ChannelPartnerFormDialog } from "../components/channel-partner-form-dialog"
import {
  useChannelPartnersPaginated,
  useChannelPartnerStats,
  useDeleteChannelPartner
} from "../hooks/use-channel-partners"

import type { ChannelPartnerDto } from "../../domain/types"

const SEARCH_SCOPES: SearchFilter[] = [
  { id: "name", displayName: "Firm name" },
  { id: "ownerPocName", displayName: "Owner" },
  { id: "email", displayName: "Email" },
  { id: "primaryPhone", displayName: "Phone" },
  { id: "reraRegNumber", displayName: "RERA number" },
  { id: "city", displayName: "City" },
  { id: "tier", displayName: "Tier" }
]

const TIER_CLASS: Record<string, string> = {
  SILVER: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  GOLD: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  PLATINUM: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300"
}

export default function ChannelPartnersPage() {
  const { filters, pagination, sorting, setFilters, setPagination, setSorting } =
    useChannelPartnersFilterStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ChannelPartnerDto | null>(null)

  const { data: stats, isLoading: statsLoading } = useChannelPartnerStats()
  const deletePartner = useDeleteChannelPartner()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission("update", "channel-partners")
  const canDelete = hasPermission("delete", "channel-partners")

  const { data: page, isFetching } = useChannelPartnersPaginated({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortingToApiFormat(sorting),
    q: filters.search || undefined,
    searchFields: toChannelPartnerSearchFields(filters.searchFields),
    fromDate: filters.fromDate,
    toDate: filters.toDate
  })

  const handleDelete = async (partner: ChannelPartnerDto) => {
    if (!partner.id) return
    if (!window.confirm(`Delete channel partner ${partner.name}?`)) return
    // A partner with attributed leads is refused with a 409, toasted centrally.
    await deletePartner.mutateAsync(partner.id).catch(() => undefined)
  }

  const columns = useMemo<ColumnDef<ChannelPartnerDto, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Firm",
        meta: { label: "Firm" },
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
      },
      {
        id: "ownerPocName",
        accessorKey: "ownerPocName",
        header: "Owner",
        meta: { label: "Owner" },
        cell: ({ row }) => row.original.ownerPocName ?? "-"
      },
      {
        id: "email",
        accessorKey: "email",
        header: "Email",
        meta: { label: "Email" },
        cell: ({ row }) => row.original.email
      },
      {
        id: "primaryPhone",
        accessorKey: "primaryPhone",
        header: "Phone",
        meta: { label: "Phone" },
        cell: ({ row }) => row.original.primaryPhone ?? "-"
      },
      {
        id: "tier",
        accessorKey: "tier",
        header: "Tier",
        meta: { label: "Tier" },
        cell: ({ row }) =>
          row.original.tier ? (
            <Badge className={TIER_CLASS[row.original.tier]}>{titleCase(row.original.tier)}</Badge>
          ) : (
            "-"
          )
      },
      {
        id: "commissionRate",
        accessorKey: "commissionRate",
        header: "Commission",
        meta: { label: "Commission" },
        cell: ({ row }) => {
          const rate = row.original.commissionRate
          if (rate == null) return "-"
          return row.original.commissionType === "FLAT" ? String(rate) : `${rate}%`
        }
      },
      {
        id: "city",
        header: "City",
        meta: { label: "City" },
        enableSorting: false,
        cell: ({ row }) => row.original.address?.city ?? "-"
      },
      {
        id: "leadCount",
        header: "Leads",
        meta: { label: "Leads" },
        enableSorting: false,
        cell: ({ row }) => row.original.leadCount ?? 0
      },
      {
        id: "onboardingStatus",
        accessorKey: "onboardingStatus",
        header: "Status",
        meta: { label: "Status" },
        cell: ({ row }) => (
          <Badge variant={row.original.onboardingStatus === "ACTIVE" ? "default" : "outline"}>
            {titleCase(row.original.onboardingStatus)}
          </Badge>
        )
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
        cell: ({ row }) => (
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
              <DropdownMenuItem
                disabled={!canUpdate}
                onClick={() => {
                  setEditing(row.original)
                  setFormOpen(true)
                }}
              >
                <Pencil className="size-3.5" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={!canDelete}
                onClick={() => handleDelete(row.original)}
              >
                <Trash2 className="size-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    ],
    // handleDelete closes over a stable mutation; recreating the columns on every render would
    // remount every cell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canUpdate, canDelete]
  )

  return (
    <Page>
      <PageHeader
        Icon={Handshake}
        title="Channel Partners"
        subtitle="Brokers and agencies that source leads."
      />

      <KpiSection className="mt-4">
        <KpiCard label="Total partners" value={stats?.total ?? 0} Icon={Handshake} isLoading={statsLoading} />
        <KpiCard label="Active" value={stats?.active ?? 0} Icon={CheckCircle2} isLoading={statsLoading} />
        <KpiCard label="Drafts" value={stats?.drafts ?? 0} Icon={FileEdit} isLoading={statsLoading} />
        <KpiCard label="Platinum tier" value={stats?.platinum ?? 0} Icon={Award} isLoading={statsLoading} />
      </KpiSection>

      <DataTable
        columns={columns}
        data={page?.content ?? []}
        getRowId={partner => partner.id ?? partner.email}
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
            columnVisibility:
              typeof updater === "function" ? updater(filters.columnVisibility ?? {}) : updater
          })
        }
        lockedColumns={["name", "actions"]}
        config={{
          showFilter: false,
          addButton: hasPermission("add", "channel-partners")
            ? {
                label: "New partner",
                onClick: () => {
                  setEditing(null)
                  setFormOpen(true)
                }
              }
            : undefined
        }}
      />

      <ChannelPartnerFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        partner={editing}
      />
    </Page>
  )
}
