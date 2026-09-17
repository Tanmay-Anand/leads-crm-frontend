import * as React from "react"

import { DayPicker, getDefaultClassNames, type DayButton } from "react-day-picker"

import { Button } from "@/shared/ui/button"
import { cn } from "@/shared/lib/utils"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  const defaultClassNames = getDefaultClassNames()

  const [view, setView] = React.useState<"days" | "months" | "years">("days")

  const { month: propMonth, defaultMonth: propDefaultMonth, onMonthChange: propOnMonthChange } = props

  const mode = props.mode
  const propSelected = "selected" in props ? props.selected : undefined

  const selectSingleDate = React.useCallback(
    (date: Date) => {
      if (props.mode !== "single") return
      // `onSelect` has different signatures depending on mode.
      // In single mode, the common usage is `onSelect={(date) => ...}`.
      const onSelect = props.onSelect as ((date: Date | undefined) => void) | undefined
      onSelect?.(date)
    },
    [props]
  )

  // Find an anchor date to initialize the visible month, normalized to midnight
  const anchorDate = React.useMemo(() => {
    let date: Date
    if (propMonth instanceof Date) date = propMonth
    else if (mode === "single" && props.selected instanceof Date) date = props.selected
    else if (mode === "range" && props.selected && "from" in props.selected && props.selected.from instanceof Date)
      date = props.selected.from
    else if (propDefaultMonth instanceof Date) date = propDefaultMonth
    else date = new Date()

    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
  }, [propMonth, propSelected, propDefaultMonth, mode])

  const [internalMonth, setInternalMonth] = React.useState<Date>(anchorDate)

  // Sync internalMonth if propMonth or propSelected changes from outside
  // Note: internalMonth is intentionally NOT in the dependency array to allow free navigation
  React.useEffect(() => {
    if (propMonth instanceof Date) {
      setInternalMonth(propMonth)
    } else if (mode === "single" && props.selected instanceof Date) {
      setInternalMonth(props.selected)
    } else if (mode === "range" && props.selected && "from" in props.selected && props.selected.from instanceof Date) {
      setInternalMonth(props.selected.from)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propMonth, propSelected, mode])

  const handleMonthChange = (date: Date) => {
    setInternalMonth(date)
    propOnMonthChange?.(date)
  }

  const handleYearChange = (offset: number) => {
    const currentYear = internalMonth.getFullYear()
    const currentMonth = internalMonth.getMonth()
    const currentDay = internalMonth.getDate()
    const targetYear = currentYear + offset

    // Construct a tentative date in the target year with the same month/day.
    // If this overflows (e.g., Feb 29 → Mar 1 in a non-leap year), clamp to the last valid day.
    let newDate = new Date(targetYear, currentMonth, currentDay)
    if (newDate.getMonth() !== currentMonth) {
      newDate = new Date(targetYear, currentMonth + 1, 0)
    }
    handleMonthChange(newDate)
  }

  if (view === "months") {
    return (
      <div
        className={cn("group/calendar flex w-[250px] flex-col gap-2 rounded-xl bg-[#130f26] p-2 text-white", className)}
      >
        <div className="relative flex h-8 items-center justify-between px-2 pt-1 text-white">
          <button
            onClick={() => handleYearChange(-1)}
            aria-label="Previous year"
            className="absolute left-0 z-10 inline-flex size-7 items-center justify-center rounded bg-transparent p-0 text-white hover:bg-white/10"
          >
            <ChevronLeft />
          </button>
          <div className="flex w-full justify-center">
            <button
              onClick={() => setView("years")}
              aria-label="Select year view"
              className="relative z-20 rounded px-2 py-0.5 text-base font-medium transition-colors hover:bg-white/10"
            >
              {internalMonth.getFullYear()}
            </button>
          </div>
          <button
            onClick={() => handleYearChange(1)}
            aria-label="Next year"
            className="absolute right-0 z-10 inline-flex size-7 items-center justify-center rounded bg-transparent p-0 text-white hover:bg-white/10"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-3 place-items-center gap-4 p-2">
          {[...Array(12)].map((_, i) => {
            const date = new Date(internalMonth)
            date.setDate(1)
            date.setMonth(i)
            const isSelected = i === internalMonth.getMonth()
            return (
              <button
                key={i}
                onClick={() => {
                  const currentYear = internalMonth.getFullYear()
                  // Prefer selected day if available for better UX
                  let currentDay = internalMonth.getDate()
                  if (mode === "single" && props.selected instanceof Date) {
                    currentDay = props.selected.getDate()
                  } else if (
                    mode === "range" &&
                    props.selected &&
                    "from" in props.selected &&
                    props.selected.from instanceof Date
                  ) {
                    currentDay = props.selected.from.getDate()
                  }

                  const targetMonth = i

                  // Handle overflow correctly (e.g., Jan 31 → Feb 28/29)
                  let newDate = new Date(currentYear, targetMonth, currentDay)
                  if (newDate.getMonth() !== targetMonth) {
                    newDate = new Date(currentYear, targetMonth + 1, 0)
                  }
                  handleMonthChange(newDate)
                  // If this calendar is used in single-select mode, picking a month should
                  // also keep the selected day in sync so the highlight matches the input.
                  selectSingleDate(newDate)
                  setView("days")
                }}
                className={cn(
                  "flex h-8 w-10 items-center justify-center rounded text-sm font-medium text-white transition-colors hover:bg-white/10",
                  isSelected && "text-[#50BEA7]" // Matching the teal/green highlight from screenshot or existing code
                )}
              >
                {date.toLocaleString("default", { month: "short" })}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  if (view === "years") {
    const currentYear = internalMonth.getFullYear()
    const startYear = currentYear - 10
    const endYear = currentYear + 10
    const years = Array.from({ length: 21 }, (_, i) => startYear + i)

    const handleYearPageChange = (offset: number) => {
      handleYearChange(offset * 21)
    }

    return (
      <div
        className={cn("group/calendar flex w-[250px] flex-col gap-2 rounded-xl bg-[#130f26] p-2 text-white", className)}
      >
        <div className="relative flex h-8 items-center justify-between px-2 pt-1 text-white">
          <button
            onClick={() => handleYearPageChange(-1)}
            aria-label="Previous years"
            className="absolute left-0 z-10 inline-flex size-7 items-center justify-center rounded bg-transparent p-0 text-white hover:bg-white/10"
          >
            <ChevronLeft />
          </button>
          <div className="flex w-full justify-center">
            <span className="text-base font-medium">
              {startYear} - {endYear}
            </span>
          </div>
          <button
            onClick={() => handleYearPageChange(1)}
            aria-label="Next years"
            className="absolute right-0 z-10 inline-flex size-7 items-center justify-center rounded bg-transparent p-0 text-white hover:bg-white/10"
          >
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-3 place-items-center gap-2 p-2">
          {years.map(year => {
            const isSelected = year === currentYear
            return (
              <button
                key={year}
                onClick={() => {
                  const currentMonth = internalMonth.getMonth()
                  // Prefer selected day if available
                  let currentDay = internalMonth.getDate()
                  if (mode === "single" && props.selected instanceof Date) {
                    currentDay = props.selected.getDate()
                  } else if (
                    mode === "range" &&
                    props.selected &&
                    "from" in props.selected &&
                    props.selected.from instanceof Date
                  ) {
                    currentDay = props.selected.from.getDate()
                  }

                  const targetYear = year

                  // Handle leap year overflow (e.g., Feb 29 → Feb 28)
                  let newDate = new Date(targetYear, currentMonth, currentDay)
                  if (newDate.getMonth() !== currentMonth) {
                    newDate = new Date(targetYear, currentMonth + 1, 0)
                  }
                  handleMonthChange(newDate)
                  setView("months")
                }}
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded text-sm text-white transition-colors hover:bg-white/10",
                  isSelected && "rounded-xl bg-white/10" // Highlight current year
                )}
                aria-label={`Select ${year}`}
              >
                {year}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      fixedWeeks
      className={cn(
        // Dark theme matching Leadrat-Black-Web: primary-black (#130f26)
        // Fixed width of 250px to match owl-date-time
        "group/calendar w-[250px] rounded-xl bg-[#130f26] px-2 py-2 text-white",
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: date => date.toLocaleString("default", { month: "short" }),
        // Format weekday to show 3-letter abbreviations: Sun, Mon, Tue, Wed, Thu, Fri, Sat
        formatWeekdayName: date => date.toLocaleString("default", { weekday: "short" }),
        // Format caption to show short month like "Jan 2026"
        formatCaption: date => `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
        ...formatters
      }}
      month={internalMonth}
      onMonthChange={handleMonthChange}
      classNames={{
        root: cn("w-[250px]", defaultClassNames.root),
        months: cn("flex flex-col relative w-full", defaultClassNames.months),
        month: cn("flex flex-col w-full gap-1", defaultClassNames.month),
        nav: cn("flex items-center w-full absolute top-0 inset-x-0 justify-between z-10", defaultClassNames.nav),
        button_previous: cn(
          "size-7 bg-transparent hover:bg-white/10 text-white rounded p-0 select-none inline-flex items-center justify-center cursor-pointer",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          "size-7 bg-transparent hover:bg-white/10 text-white rounded p-0 select-none inline-flex items-center justify-center cursor-pointer",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-8 w-full text-white font-medium text-base",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-base font-medium justify-center gap-1.5 text-white",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn("relative border border-white/20 rounded-md bg-[#130f26]", defaultClassNames.dropdown_root),
        dropdown: cn("absolute bg-[#130f26] inset-0 opacity-0 text-white", defaultClassNames.dropdown),
        caption_label: cn("select-none font-normal text-white text-xl", defaultClassNames.caption_label),
        // `month_grid` is react-day-picker v9's key for the <table>; the old `table` key was
        // silently ignored, leaving the grid on table layout while its rows were forced to
        // `display: flex`. Row heights then came from `aspect-square` on the day button, whose
        // width came back out of table auto-layout — a circular dependency across two layout
        // models that let the grid's total height disagree with the sum of its rows, so the
        // panel background could end short and the last weeks spilled out of it. Making the
        // grid, its body and its rows one plain flex column takes table layout out of the
        // picture: every row's width now derives from the calendar's own fixed width.
        month_grid: cn("flex w-full flex-col", defaultClassNames.month_grid),
        weeks: cn("flex w-full flex-col", defaultClassNames.weeks),
        weekdays: cn("flex w-full", defaultClassNames.weekdays),
        weekday: cn(
          "text-white flex-1 font-normal text-sm select-none h-8 mb-2 flex items-center justify-center",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full", defaultClassNames.week),
        week_number_header: cn("select-none w-8", defaultClassNames.week_number_header),
        week_number: cn("text-xs select-none text-white/50", defaultClassNames.week_number),
        day: cn("relative flex-1 p-0 text-center group/day select-none", defaultClassNames.day),
        range_start: cn("", defaultClassNames.range_start),
        range_middle: cn("bg-[#ff000033]", defaultClassNames.range_middle),
        range_end: cn("", defaultClassNames.range_end),
        today: cn("", defaultClassNames.today),
        outside: cn("text-[rgb(140,148,221)]", defaultClassNames.outside),
        disabled: cn("text-white/30 opacity-50 cursor-not-allowed", defaultClassNames.disabled),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return <div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={className} {...props} />
          }

          if (orientation === "right") {
            return <ChevronRight className={className} {...props} />
          }

          // Default fallback - return left arrow
          return <ChevronLeft className={className} {...props} />
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-8 items-center justify-center text-center text-xs text-white/50">
                {children}
              </div>
            </td>
          )
        },
        CaptionLabel: ({ children }) => (
          <button
            onClick={() => setView("months")}
            aria-label="Select month and year"
            aria-expanded={view !== "days"}
            className="relative z-20 rounded px-2 text-lg font-medium transition-colors hover:bg-white/10"
          >
            {children}
          </button>
        ),
        ...components
      }}
      {...props}
    />
  )
}

const ChevronLeft = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={cn("size-3 fill-white", className)} viewBox="0 0 250.738 250.738" {...props}>
    <path d="M96.633,125.369l95.053-94.533c7.101-7.055,7.101-18.492,0-25.546c-7.1-7.054-18.613-7.054-25.714,0L58.989,111.689c-3.784,3.759-5.487,8.759-5.238,13.68c-0.249,4.922,1.454,9.921,5.238,13.681l106.983,106.398c7.101,7.055,18.613,7.055,25.714,0c7.101-7.054,7.101-18.491,0-25.544L96.633,125.369z" />
  </svg>
)

const ChevronRight = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg className={cn("size-3 fill-white", className)} viewBox="0 0 250.738 250.738" {...props}>
    <path d="M191.75,111.689L84.766,5.291c-7.1-7.055-18.613-7.055-25.713,0c-7.101,7.054-7.101,18.49,0,25.544l95.053,94.534l-95.053,94.533c-7.101,7.054-7.101,18.491,0,25.545c7.1,7.054,18.613,7.054,25.713,0L191.75,139.05c3.784-3.759,5.487-8.759,5.238-13.681C197.237,120.447,195.534,115.448,191.75,111.689z" />
  </svg>
)

function CalendarDayButton({ className, day, modifiers, ...props }: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef<HTMLButtonElement>(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  // Determine modifiers
  const isToday = modifiers.today
  const isSelected = modifiers.selected
  const isRangeStart = modifiers.range_start
  const isRangeEnd = modifiers.range_end
  const isRangeMiddle = modifiers.range_middle
  const isOutside = modifiers.outside

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={isSelected && !isRangeStart && !isRangeEnd && !isRangeMiddle}
      data-range-start={isRangeStart}
      data-range-end={isRangeEnd}
      data-range-middle={isRangeMiddle}
      data-today={isToday}
      data-outside={isOutside}
      className={cn(
        // Base styles - matching owl-date-time cell sizing
        "flex aspect-square w-full cursor-pointer items-center justify-center text-base font-normal transition-colors",
        // Default text color - white for current month, lavender for outside days
        isOutside ? "text-[rgb(140,148,221)]" : "text-white",
        // Default rounded for non-range
        "rounded-full",
        // Hover state
        "hover:bg-white/10",
        // Selected single date - orange like owl-date-time ($orange-500: #fd6524)
        "data-[selected-single=true]:bg-[#fd6524] data-[selected-single=true]:text-white",
        // Range start - orange circle
        "data-[range-start=true]:rounded-full data-[range-start=true]:bg-[#fd6524] data-[range-start=true]:text-white",
        // Range end - orange circle
        "data-[range-end=true]:rounded-full data-[range-end=true]:bg-[#fd6524] data-[range-end=true]:text-white",
        // Range middle - keep round but no background (background handled by parent)
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-transparent",
        // Today indicator - green background like custom-today class
        isToday && !isSelected && !isRangeStart && !isRangeEnd && "rounded-full bg-[#50BEA7] text-white",
        // Focus state
        "focus-visible:ring-2 focus-visible:ring-[#fd6524] focus-visible:ring-offset-1 focus-visible:ring-offset-[#130f26] focus-visible:outline-none",
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
