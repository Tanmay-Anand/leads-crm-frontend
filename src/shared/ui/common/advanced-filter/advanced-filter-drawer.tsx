import { useMemo } from "react"

import {
  FILTER_GROUP_LABELS,
  FILTER_GROUP_ORDER,
  type FilterCriterion,
  type FilterFieldDto,
  type FilterGroup
} from "@/domains/leads/domain/advanced-filter.types"
import { Accordion } from "@/shared/ui/common/advanced-filter/accordion-section"

import { FilterFieldControl } from "./filter-field-control"

interface AdvancedFilterDrawerProps {
  fields: FilterFieldDto[]
  criteria: FilterCriterion[]
  onChange: (criteria: FilterCriterion[]) => void
  isLoading?: boolean
}

/**
 * The filter drawer, generated entirely from the field metadata the backend publishes.
 *
 * Nothing here knows what a lead is: adding a field to LeadFilterField on the server adds a
 * control here, and removing one removes it, with no change on this side. That is the whole point
 * of the registry.
 */
export function AdvancedFilterDrawer({ fields, criteria, onChange, isLoading }: AdvancedFilterDrawerProps) {
  const grouped = useMemo(() => {
    const byGroup = new Map<FilterGroup, FilterFieldDto[]>()
    for (const field of fields) {
      const existing = byGroup.get(field.group) ?? []
      existing.push(field)
      byGroup.set(field.group, existing)
    }
    // Ordered by the shared group order rather than by whatever order the server listed fields in,
    // so the drawer reads the same on every screen.
    return FILTER_GROUP_ORDER.filter(group => byGroup.has(group)).map(group => ({
      group,
      fields: byGroup.get(group) ?? []
    }))
  }, [fields])

  const upsert = (criterion: FilterCriterion | undefined, fieldKey: string) => {
    const without = criteria.filter(existing => existing.field !== fieldKey)
    onChange(criterion ? [...without, criterion] : without)
  }

  if (isLoading) {
    return <p className="text-muted-foreground py-6 text-sm">Loading filters...</p>
  }

  if (fields.length === 0) {
    return <p className="text-muted-foreground py-6 text-sm">No filters are available.</p>
  }

  return (
    <div className="space-y-2 py-2">
      {grouped.map(({ group, fields: groupFields }) => {
        const activeCount = groupFields.filter(field =>
          criteria.some(criterion => criterion.field === field.key)
        ).length

        return (
          <Accordion
            key={group}
            title={FILTER_GROUP_LABELS[group]}
            badge={activeCount > 0 ? activeCount : undefined}
            defaultOpen={activeCount > 0}
          >
            <div className="space-y-4 pt-1">
              {groupFields.map(field => (
                <FilterFieldControl
                  key={field.key}
                  field={field}
                  criterion={criteria.find(criterion => criterion.field === field.key)}
                  onChange={criterion => upsert(criterion, field.key)}
                />
              ))}
            </div>
          </Accordion>
        )
      })}
    </div>
  )
}
