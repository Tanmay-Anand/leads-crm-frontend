import type {
  FilterCriterion,
  FilterFieldDto,
  FilterOperator
} from "@/domains/leads/domain/advanced-filter.types"
import { useFilterOptions } from "@/domains/leads/presentation/hooks/use-leads"
import { Checkbox } from "@/shared/ui/checkbox"
import { Input } from "@/shared/ui/input"
import { Label } from "@/shared/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select"

interface FilterFieldControlProps {
  field: FilterFieldDto
  criterion?: FilterCriterion
  onChange: (criterion: FilterCriterion | undefined) => void
}

/**
 * Renders one filter row from its server-declared metadata.
 *
 * The control follows valueType, and the operator follows the control rather than being a second
 * thing to pick: the field already declares which operators it allows, so offering the user a
 * choice between IN and NOT_IN on a dropdown is a decision they do not need to make. The first
 * allowed operator of the right shape is used.
 */
export function FilterFieldControl({ field, criterion, onChange }: FilterFieldControlProps) {
  // Only fetched once this control is on screen, which is what keeps the drawer cheap.
  const { data: options, isLoading } = useFilterOptions(field.optionsSource, {
    enabled: Boolean(field.optionsSource)
  })

  const emit = (values: string[], operator: FilterOperator) => {
    // An empty selection removes the criterion entirely rather than sending an empty IN, which
    // the backend would read as "match nothing".
    onChange(values.length > 0 ? { field: field.key, operator, values } : undefined)
  }

  const pick = (...candidates: FilterOperator[]): FilterOperator =>
    candidates.find(candidate => field.operators.includes(candidate)) ?? field.operators[0]

  if (field.optionsSource) {
    const operator = pick("IN", "ANY_OF", "EQ")
    const selected = criterion?.values ?? []

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{field.label}</Label>
        {isLoading ? (
          <p className="text-muted-foreground text-xs">Loading...</p>
        ) : !options || options.length === 0 ? (
          <p className="text-muted-foreground text-xs">Nothing to choose from yet.</p>
        ) : (
          <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-md border p-2">
            {options.map(option => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm">
                <Checkbox
                  checked={selected.includes(option.value)}
                  onCheckedChange={checked => {
                    const next = checked
                      ? [...selected, option.value]
                      : selected.filter(value => value !== option.value)
                    emit(next, operator)
                  }}
                />
                <span className="truncate">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (field.valueType === "BOOLEAN") {
    const operator = pick("EQ")
    const value = criterion?.values[0]

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{field.label}</Label>
        <Select
          value={value ?? "any"}
          onValueChange={next => (next === "any" ? onChange(undefined) : emit([next], operator))}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="true">Yes</SelectItem>
            <SelectItem value="false">No</SelectItem>
          </SelectContent>
        </Select>
      </div>
    )
  }

  if (field.valueType === "DATE" || field.valueType === "DATETIME") {
    const operator = pick("BETWEEN", "GTE", "GT")
    const [from = "", to = ""] = criterion?.values ?? []

    return (
      <div className="space-y-2">
        <Label className="text-xs font-medium">{field.label}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={from ? from.slice(0, 10) : ""}
            className="h-8"
            aria-label={`${field.label} from`}
            // The backend coerces DATETIME with LocalDateTime.parse, so a bare date would not
            // parse; the day is widened to its full span here.
            onChange={event => {
              const nextFrom = event.target.value ? `${event.target.value}T00:00:00` : ""
              emit([nextFrom, to].filter(Boolean), operator)
            }}
          />
          <span className="text-muted-foreground text-xs">to</span>
          <Input
            type="date"
            value={to ? to.slice(0, 10) : ""}
            className="h-8"
            aria-label={`${field.label} to`}
            onChange={event => {
              const nextTo = event.target.value ? `${event.target.value}T23:59:59` : ""
              emit([from, nextTo].filter(Boolean), operator)
            }}
          />
        </div>
      </div>
    )
  }

  const operator = pick("CONTAINS", "EQ")

  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">{field.label}</Label>
      <Input
        value={criterion?.values[0] ?? ""}
        className="h-8"
        placeholder={`Filter by ${field.label.toLowerCase()}`}
        onChange={event => emit(event.target.value ? [event.target.value] : [], operator)}
      />
    </div>
  )
}
