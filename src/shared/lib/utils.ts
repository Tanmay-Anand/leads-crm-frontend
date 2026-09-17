import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

const FALLBACK_ERROR_MSG = "Something went wrong. Please try again."

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Shows an error toast keyed by its own text, so the same failure reported twice appears once.
 *
 * One rejected request is routinely surfaced by two layers: the global mutation-cache handler, and
 * a caller that catches the rejection to drive its own UI. Both end up with the same backend
 * string, which would stack two identical toasts. A message-derived id makes sonner update the
 * existing toast instead of adding a second, without either layer knowing the other exists.
 */
export const showErrorToast = (message: string) => {
  toast.error(message, { id: `error:${message}` })
}

/** Pulls the backend message out of an API rejection, falling back to a generic line. */
export const getErrorMessage = (error: unknown): string => {
  const data = (error as { data?: { message?: string } })?.data
  return data?.message ?? FALLBACK_ERROR_MSG
}

export const handleErrorToast = (error: unknown) => {
  showErrorToast(getErrorMessage(error))
}

/**
 * Builds the query string for a list endpoint, dropping empty values.
 *
 * Array values are joined with commas, which is what Spring expects for a repeated enum parameter.
 */
export const buildListQuery = (params: object): string => {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      search.append(key, value.join(","))
      continue
    }
    search.append(key, String(value))
  }

  const queryString = search.toString()
  return queryString ? `?${queryString}` : ""
}

/**
 * Maps the toolbar field ids onto a backend search-field enum.
 *
 * The toolbar encodes a selected chip as `fieldId:value`, so only the part before the colon is the
 * field. An id with no mapping is dropped rather than sent through, since the backend rejects an
 * unknown enum value with a 400.
 */
export const createSearchFieldMapper =
  <T extends string>(map: Record<string, T>) =>
  (searchFields?: string): T[] => {
    if (!searchFields) return []
    const seen = new Set<T>()
    for (const item of searchFields.split(",")) {
      const fieldId = item.split(":")[0]?.trim()
      const mapped = fieldId ? map[fieldId] : undefined
      if (mapped) seen.add(mapped)
    }
    return [...seen]
  }

/** Formats an ISO timestamp for display, tolerating a null or unparseable value. */
export const formatDate = (value?: string | null, withTime = false): string => {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return withTime ? date.toLocaleString() : date.toLocaleDateString()
}

/** yyyy-MM-dd, the shape the backend date-range parameters expect. */
export const toApiDate = (date?: Date | null): string | undefined => {
  if (!date) return undefined
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

/** SCREAMING_SNAKE becomes Title Case, for enum values rendered without a server label. */
export const titleCase = (value?: string | null): string => {
  if (!value) return "-"
  return value
    .split("_")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}
