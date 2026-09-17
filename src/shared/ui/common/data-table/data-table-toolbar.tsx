import { useEffect, useState } from "react"

import { Check, Filter, Plus, Search, Settings2, X } from "lucide-react"

import { useDebouncedValue } from "@/shared/hooks/use-debounced-value"
import { cn } from "@/shared/lib/utils"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/ui/sheet"

import type { DataTableToolbarProps } from "./data-table.types"

/** Matches the two-character minimum the backend enforces before it will run a text search. */
const MIN_SEARCH_LENGTH = 2

export function DataTableToolbar<TData>({
  table,
  config,
  globalFilter,
  onGlobalFilterChange,
  lockedColumns = [],
  filterContent,
  filterActions,
  onFilterSearch,
  onFilterReset,
  availableSearchFilters,
  hasActiveFilters,
  className
}: DataTableToolbarProps<TData>) {
  const [term, setTerm] = useState(globalFilter)
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedTerm = useDebouncedValue(term, 400)

  /**
   * Re-syncs the input when the term is changed from outside — a filter reset, or restoring
   * state from the URL on a back navigation.
   *
   * Adjusted during render rather than in an effect. The effect version set state on every
   * external change, which React 19 flags as a cascading render: the component painted the old
   * term, then immediately re-rendered with the new one. Comparing against the last prop we saw
   * does the same job before the first paint.
   */
  const [lastExternalTerm, setLastExternalTerm] = useState(globalFilter)
  if (globalFilter !== lastExternalTerm) {
    setLastExternalTerm(globalFilter)
    setTerm(globalFilter)
  }

  // The committed term, normalised. Below the minimum the server ignores the term anyway, so an
  // empty search is sent rather than a request that quietly returns the unfiltered list.
  const trimmed = debouncedTerm.trim()
  const committedTerm = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : ""

  useEffect(() => {
    if (committedTerm !== globalFilter) {
      onGlobalFilterChange(committedTerm, selectedScopes.join(","))
    }
    // globalFilter and onGlobalFilterChange are deliberately omitted: the parent re-creates the
    // callback each render, and reacting to globalFilter would re-fire the search it just caused.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [committedTerm, selectedScopes])

  const toggleScope = (id: string) => {
    setSelectedScopes(current =>
      current.includes(id) ? current.filter(scope => scope !== id) : [...current, id]
    )
  }

  const hideableColumns = table
    .getAllColumns()
    .filter(column => column.getCanHide() && !lockedColumns.includes(column.id))

  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-3", className)}>
      {config?.showSearch !== false && (
        <div className="relative w-full max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
          <Input
            value={term}
            onChange={event => setTerm(event.target.value)}
            placeholder="Search..."
            className="h-8 pr-8 pl-8"
            aria-label="Search"
          />
          {term && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setTerm("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      )}

      {availableSearchFilters && availableSearchFilters.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Search in
              {selectedScopes.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {selectedScopes.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Restrict the search</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableSearchFilters.map(scope => (
              <DropdownMenuCheckboxItem
                key={scope.id}
                checked={selectedScopes.includes(scope.id)}
                onCheckedChange={() => toggleScope(scope.id)}
                onSelect={event => event.preventDefault()}
              >
                {scope.displayName}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedScopes.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  type="button"
                  onClick={() => setSelectedScopes([])}
                  className="hover:bg-muted w-full rounded-sm px-2 py-1.5 text-left text-sm"
                >
                  Search all fields
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {config?.showFilter !== false && filterContent && (
        <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
          <SheetTrigger asChild>
            <Button variant={hasActiveFilters ? "default" : "outline"} size="sm">
              <Filter className="size-3.5" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4">{filterContent}</div>
            <SheetFooter className="flex-row justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  onFilterReset?.()
                  setFilterOpen(false)
                }}
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  onFilterSearch?.()
                  setFilterOpen(false)
                }}
              >
                <Check className="size-3.5" />
                Apply
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {filterActions}

      <div className="ml-auto flex items-center gap-2">
        {config?.showColumnVisibility !== false && hideableColumns.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="size-3.5" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hideableColumns.map(column => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={value => column.toggleVisibility(Boolean(value))}
                  onSelect={event => event.preventDefault()}
                >
                  {String(column.columnDef.meta?.label ?? column.id)}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {config?.addButton && (
          <Button size="sm" onClick={config.addButton.onClick}>
            <Plus className="size-3.5" />
            {config.addButton.label}
          </Button>
        )}
      </div>
    </div>
  )
}
