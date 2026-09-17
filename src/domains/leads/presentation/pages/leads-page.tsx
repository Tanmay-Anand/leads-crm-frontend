import { useState } from "react"

import { CalendarClock, CheckCircle2, UserMinus, Users } from "lucide-react"

import { Button } from "@/shared/ui/button"
import { AdvancedFilterDrawer } from "@/shared/ui/common/advanced-filter"
import { KpiCard, KpiSection } from "@/shared/ui/common/kpi-section"
import { sortingToApiFormat } from "@/shared/ui/common/data-table"
import { Page, PageHeader } from "@/shared/ui/layout/pages"

import { useLeadsFilterStore } from "../../application/store/leads-filter.store"
import type { FilterCriterion } from "../../domain/advanced-filter.types"
import type { LeadDto } from "../../domain/types"
import { toLeadSearchFields } from "../../infrastructure/api/leads.service"
import { LeadDetailSheet } from "../components/lead-detail-sheet"
import { LeadFormDialog } from "../components/lead-form-dialog"
import { LeadsTable } from "../components/leads-table"
import { useDeleteLead, useLeadFilterFields, useLeadsPaginated, useLeadSummary } from "../hooks/use-leads"

export default function LeadsPage() {
  const { filters, pagination, sorting, setFilters, setPagination, setSorting, resetFilters } =
    useLeadsFilterStore()

  // The drawer edits a draft, and only Apply commits it to the store. Editing the live filters
  // would refetch the list on every checkbox while the drawer is still open.
  const [draftCriteria, setDraftCriteria] = useState<FilterCriterion[]>(filters.criteria)

  const [formOpen, setFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadDto | null>(null)
  const [selectedLead, setSelectedLead] = useState<LeadDto | null>(null)

  const { data: filterFields, isLoading: fieldsLoading } = useLeadFilterFields()
  const { data: summary, isLoading: summaryLoading } = useLeadSummary()
  const deleteLead = useDeleteLead()

  const { data: page, isFetching } = useLeadsPaginated(
    {
      page: pagination.pageIndex,
      size: pagination.pageSize,
      sort: sortingToApiFormat(sorting),
      q: filters.search || undefined,
      searchFields: toLeadSearchFields(filters.searchFields),
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      dateType: filters.dateType
    },
    { criteria: filters.criteria, scope: filters.scope }
  )

  const handleAdd = () => {
    setEditingLead(null)
    setFormOpen(true)
  }

  const handleEdit = (lead: LeadDto) => {
    setSelectedLead(null)
    setEditingLead(lead)
    setFormOpen(true)
  }

  const handleDelete = async (lead: LeadDto) => {
    const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.mobile
    if (!window.confirm(`Delete lead ${name}? This can be undone only by an administrator.`)) return
    await deleteLead.mutateAsync(lead.id)
  }

  const hasActiveFilters = filters.criteria.length > 0

  return (
    <Page>
      <PageHeader
        Icon={Users}
        title="Leads"
        subtitle="Capture, qualify and follow up on enquiries."
      />

      <KpiSection className="mt-4">
        <KpiCard label="Total leads" value={summary?.total ?? 0} Icon={Users} isLoading={summaryLoading} />
        <KpiCard
          label="Created this month"
          value={summary?.createdThisMonth ?? 0}
          Icon={CheckCircle2}
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Unassigned"
          value={summary?.unassigned ?? 0}
          Icon={UserMinus}
          isLoading={summaryLoading}
        />
        <KpiCard
          label="Due today"
          value={summary?.dueToday ?? 0}
          Icon={CalendarClock}
          isLoading={summaryLoading}
        />
      </KpiSection>

      <LeadsTable
        data={page?.content ?? []}
        isLoading={isFetching}
        totalElements={page?.totalElements}
        pageCount={page?.totalPages}
        pagination={pagination}
        onPaginationChange={setPagination}
        sorting={sorting}
        onSortingChange={setSorting}
        globalFilter={filters.search}
        onGlobalFilterChange={(search, searchFields) => setFilters({ search, searchFields: searchFields ?? "" })}
        columnVisibility={filters.columnVisibility}
        onColumnVisibilityChange={updater =>
          setFilters({
            columnVisibility:
              typeof updater === "function" ? updater(filters.columnVisibility ?? {}) : updater
          })
        }
        hasActiveFilters={hasActiveFilters}
        filterContent={
          <AdvancedFilterDrawer
            fields={filterFields ?? []}
            criteria={draftCriteria}
            onChange={setDraftCriteria}
            isLoading={fieldsLoading}
          />
        }
        filterActions={
          hasActiveFilters ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setDraftCriteria([])
                resetFilters()
              }}
            >
              Clear filters
            </Button>
          ) : null
        }
        onFilterSearch={() => setFilters({ criteria: draftCriteria })}
        onFilterReset={() => {
          setDraftCriteria([])
          resetFilters()
        }}
        onAdd={handleAdd}
        onView={setSelectedLead}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <LeadFormDialog
        open={formOpen}
        onOpenChange={open => {
          setFormOpen(open)
          if (!open) setEditingLead(null)
        }}
        lead={editingLead}
      />

      <LeadDetailSheet
        lead={selectedLead}
        onOpenChange={open => !open && setSelectedLead(null)}
        onEdit={handleEdit}
      />
    </Page>
  )
}
