import { useMemo, useState } from "react"

import { Building2, CheckCircle2, FileEdit, Rocket } from "lucide-react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"

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


import { useProjectsFilterStore } from "../../application/store/projects-filter.store"
import { toProjectSearchFields } from "../../infrastructure/api/projects.service"
import { ProjectFormDialog } from "../components/project-form-dialog"
import { useDeleteProject, useProjectsPaginated, useProjectStats } from "../hooks/use-projects"

import type { ProjectDto } from "../../domain/types"

const SEARCH_SCOPES: SearchFilter[] = [
  { id: "name", displayName: "Name" },
  { id: "brand", displayName: "Brand" },
  { id: "city", displayName: "City" },
  { id: "state", displayName: "State" },
  { id: "microMarket", displayName: "Micro market" },
  { id: "reraNumber", displayName: "RERA number" },
  { id: "projectType", displayName: "Type" },
  { id: "projectStage", displayName: "Stage" }
]

export default function ProjectsPage() {
  const { filters, pagination, sorting, setFilters, setPagination, setSorting } = useProjectsFilterStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProjectDto | null>(null)

  const { data: stats, isLoading: statsLoading } = useProjectStats()
  const deleteProject = useDeleteProject()
  const { hasPermission } = usePermission()
  const canUpdate = hasPermission("update", "projects")
  const canDelete = hasPermission("delete", "projects")

  const { data: page, isFetching } = useProjectsPaginated({
    page: pagination.pageIndex,
    size: pagination.pageSize,
    sort: sortingToApiFormat(sorting),
    q: filters.search || undefined,
    searchFields: toProjectSearchFields(filters.searchFields),
    fromDate: filters.fromDate,
    toDate: filters.toDate
  })

  const handleDelete = async (project: ProjectDto) => {
    if (!project.id) return
    if (!window.confirm(`Delete project ${project.name}?`)) return
    // A project with leads on it is refused by the API with a 409, which the central handler
    // toasts, so there is nothing to do here beyond letting it reject.
    await deleteProject.mutateAsync(project.id).catch(() => undefined)
  }

  const columns = useMemo<ColumnDef<ProjectDto, unknown>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: "Name",
        meta: { label: "Name" },
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
      },
      {
        id: "brand",
        accessorKey: "brand",
        header: "Brand",
        meta: { label: "Brand" },
        cell: ({ row }) => row.original.brand ?? "-"
      },
      {
        id: "projectType",
        accessorKey: "projectType",
        header: "Type",
        meta: { label: "Type" },
        cell: ({ row }) => titleCase(row.original.projectType)
      },
      {
        id: "projectStage",
        accessorKey: "projectStage",
        header: "Stage",
        meta: { label: "Stage" },
        cell: ({ row }) =>
          row.original.projectStage ? (
            <Badge variant="secondary">{titleCase(row.original.projectStage)}</Badge>
          ) : (
            "-"
          )
      },
      {
        id: "city",
        header: "City",
        meta: { label: "City" },
        enableSorting: false,
        cell: ({ row }) => row.original.address?.city ?? "-"
      },
      {
        id: "reraNumber",
        accessorKey: "reraNumber",
        header: "RERA",
        meta: { label: "RERA" },
        cell: ({ row }) => row.original.reraNumber ?? "-"
      },
      {
        id: "leadCount",
        header: "Leads",
        meta: { label: "Leads" },
        enableSorting: false,
        cell: ({ row }) => row.original.leadCount ?? 0
      },
      {
        id: "saveStatus",
        accessorKey: "saveStatus",
        header: "Setup",
        meta: { label: "Setup" },
        cell: ({ row }) => (
          <Badge variant={row.original.saveStatus === "COMPLETED" ? "default" : "outline"}>
            {titleCase(row.original.saveStatus)}
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
      <PageHeader Icon={Building2} title="Projects" subtitle="The inventory leads are enquiring about." />

      <KpiSection className="mt-4">
        <KpiCard label="Total projects" value={stats?.total ?? 0} Icon={Building2} isLoading={statsLoading} />
        <KpiCard label="Drafts" value={stats?.drafts ?? 0} Icon={FileEdit} isLoading={statsLoading} />
        <KpiCard label="Launched" value={stats?.launched ?? 0} Icon={Rocket} isLoading={statsLoading} />
        <KpiCard label="Delivered" value={stats?.delivered ?? 0} Icon={CheckCircle2} isLoading={statsLoading} />
      </KpiSection>

      <DataTable
        columns={columns}
        data={page?.content ?? []}
        getRowId={project => project.id ?? project.name}
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
          addButton: hasPermission("add", "projects")
            ? {
                label: "New project",
                onClick: () => {
                  setEditing(null)
                  setFormOpen(true)
                }
              }
            : undefined
        }}
      />

      <ProjectFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditing(null)
        }}
        project={editing}
      />
    </Page>
  )
}
