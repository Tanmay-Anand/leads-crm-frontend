import { fetchAuthSession } from "aws-amplify/auth"
import { toast } from "sonner"

import { tenantSession } from "@/infrastructure/session/tenant-session.adapter"

import { env } from "../config/env"

/**
 * API client.
 *
 * Fetch-based HTTP client that handles auth token caching, a single retry on 401, tenant header
 * injection, and uniform error handling.
 *
 * The reference resolves between several microservices behind one gateway, so its client takes a
 * service namespace. This backend is a single service, so the namespace collapses to the one
 * context path; the resource-scoped shape callers use is unchanged.
 */

// ── Token cache (module-scoped) ───────────────────────────────────────────────

let cachedToken: string | null = null
let expirationTime = 0
let refreshPromise: Promise<string | null> | null = null

/** Refresh the token 60s before it actually expires, to avoid a race at the boundary. */
const EXPIRATION_BUFFER_MS = 60 * 1_000

/** Context path the backend serves everything under. */
const CONTEXT_PATH = "/leads-crm"

// ── Token helpers ─────────────────────────────────────────────────────────────

const refreshToken = async (): Promise<string | null> => {
  try {
    const session = await fetchAuthSession()
    const idToken = session.tokens?.idToken

    if (idToken) {
      cachedToken = idToken.toString()

      const exp = idToken.payload?.exp
      expirationTime =
        typeof exp === "number"
          ? exp * 1_000 // JWT exp is in seconds
          : Date.now() + 60 * 60 * 1_000 // fallback: 1 hour

      return cachedToken
    }

    return null
  } catch (error) {
    console.error("Failed to fetch auth session:", error)
    clearTokenCache()
    return null
  }
}

/**
 * Returns a valid bearer token, reading from cache when possible.
 *
 * Concurrent callers share one in-flight refresh, so a page that fires six requests at once still
 * makes a single Amplify round-trip.
 */
export const getAuthToken = async (): Promise<string | null> => {
  const now = Date.now()

  if (cachedToken && now < expirationTime - EXPIRATION_BUFFER_MS) {
    return cachedToken
  }

  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = refreshToken()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

/** Evicts the cached token entirely. Call on sign-out or an unrecoverable auth error. */
export const clearTokenCache = (): void => {
  cachedToken = null
  expirationTime = 0
}

/**
 * Marks the cached token as expired without discarding it.
 *
 * The value is kept so an in-flight retry can tell whether the refresh actually produced a
 * different token before retrying, rather than replaying the same rejected one.
 */
export const invalidateTokenCache = (): void => {
  expirationTime = 0
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface ApiRequestOptions extends RequestInit {
  /** Request body, serialised to JSON automatically unless it is FormData. */
  data?: unknown
  /** Skips the Authorization header. */
  isPublic?: boolean
  /** Key/value pairs appended as query-string parameters. Nullish values are omitted. */
  params?: Record<string, string | number | boolean | undefined | null>
  /** How to deserialise the response body. Defaults to json. */
  responseType?: "json" | "blob" | "text"
}

export interface ApiError {
  status: number
  data: { message?: string } & Record<string, unknown>
  response: Response
}

// ── Core dispatcher ───────────────────────────────────────────────────────────

const dispatchCall = async <Response_>(
  url: string,
  init: ApiRequestOptions = {},
  retry = true
): Promise<Response_> => {
  try {
    const token = await getAuthToken()
    const tenantId = tenantSession.getTenantId()

    const headers = new Headers(init.headers)

    if (token && !(init.isPublic ?? false)) headers.set("Authorization", `Bearer ${token}`)
    // Optional for a tenant-scoped user, whose JWT carries the claim, and required for a platform
    // user, whose does not. Sent whenever we have one so both paths behave the same.
    if (tenantId) headers.set("x-tenant-id", tenantId)

    let requestUrl = url
    if (init.params) {
      const queryParams = new URLSearchParams()
      for (const [key, value] of Object.entries(init.params)) {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value))
        }
      }
      const queryString = queryParams.toString()
      if (queryString) {
        requestUrl += (requestUrl.includes("?") ? "&" : "?") + queryString
      }
    }

    if (init.data instanceof FormData) {
      headers.delete("content-type") // let the browser set the multipart boundary
    } else if (init.data && !headers.has("content-type")) {
      headers.set("content-type", "application/json")
    }

    const response = await fetch(requestUrl, {
      ...init,
      headers,
      body: init.data ? (init.data instanceof FormData ? init.data : JSON.stringify(init.data)) : init.body
    })

    // Single retry on 401, for the window where the cached token expired mid-flight.
    if (response.status === 401 && retry) {
      invalidateTokenCache()
      const newToken = await getAuthToken()
      if (newToken && newToken !== token) {
        return dispatchCall<Response_>(url, init, false)
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))

      if (response.status === 401) {
        clearTokenCache()
        const publicPaths = ["/signin"]
        const isPublicPath = typeof window !== "undefined" && publicPaths.includes(window.location.pathname)

        if (typeof window !== "undefined" && !isPublicPath) {
          window.location.href = "/signin"
        }
        if (!isPublicPath) {
          toast.error("Unauthorized. Please sign in again.")
        }
      } else if (response.status === 403) {
        toast.error("Forbidden: you do not have permission to access this resource.")
      }

      throw { status: response.status, data: errorData, response } satisfies ApiError
    }

    if (init.responseType === "blob") return (await response.blob()) as Response_
    if (init.responseType === "text") return (await response.text()) as Response_

    // 204 and friends have no body; JSON.parse on an empty string would throw.
    const text = await response.text()
    return (text ? JSON.parse(text) : {}) as Response_
  } catch (error) {
    if ((error as ApiError)?.status) throw error

    console.error("API client error:", error)
    const connectionError = error instanceof Error ? error : new Error("Connection error")
    ;(connectionError as Error & { isConnectionError?: boolean }).isConnectionError = true
    throw connectionError
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

const buildHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken()
  const tenantId = tenantSession.getTenantId()
  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  if (tenantId) headers["x-tenant-id"] = tenantId
  return headers
}

export const api = {
  /**
   * Returns a client rooted at the service, without a resource prefix.
   *
   * Use it when you need control over the whole path, or when working across several resources.
   */
  getClient(baseInit?: RequestInit) {
    const serviceUrl = `${env.serverUrl}${CONTEXT_PATH}`

    return {
      serviceUrl,
      getHeaders: buildHeaders,

      get: <Res>(path: string, init: ApiRequestOptions = baseInit ?? {}) =>
        dispatchCall<Res>(`${serviceUrl}${path}`, { ...init, method: "GET" }),

      post: <Req, Res>(path: string, data: Req, init: ApiRequestOptions = baseInit ?? {}) =>
        dispatchCall<Res>(`${serviceUrl}${path}`, { ...init, method: "POST", data }),

      put: <Req, Res>(path: string, data: Req, init: ApiRequestOptions = baseInit ?? {}) =>
        dispatchCall<Res>(`${serviceUrl}${path}`, { ...init, method: "PUT", data }),

      patch: <Req, Res>(path: string, data: Req, init: ApiRequestOptions = baseInit ?? {}) =>
        dispatchCall<Res>(`${serviceUrl}${path}`, { ...init, method: "PATCH", data }),

      delete: <Res>(path: string, init: ApiRequestOptions = baseInit ?? {}) =>
        dispatchCall<Res>(`${serviceUrl}${path}`, { ...init, method: "DELETE" })
    }
  },

  /**
   * Returns a client with a fixed resource prefix, so a service file names its paths relative to
   * its own resource.
   *
   * @example
   * const leadsApi = api.getService("leads")
   * await leadsApi.get("/filter-fields")
   */
  getService(resourcePath: string, baseInit?: RequestInit) {
    const client = this.getClient(baseInit)
    const prefix = resourcePath.startsWith("/") ? resourcePath : `/${resourcePath}`

    return {
      ...client,
      get: <Res>(path = "", init?: ApiRequestOptions) => client.get<Res>(`${prefix}${path}`, init),
      post: <Req, Res>(path: string, data: Req, init?: ApiRequestOptions) =>
        client.post<Req, Res>(`${prefix}${path}`, data, init),
      put: <Req, Res>(path: string, data: Req, init?: ApiRequestOptions) =>
        client.put<Req, Res>(`${prefix}${path}`, data, init),
      patch: <Req, Res>(path: string, data: Req, init?: ApiRequestOptions) =>
        client.patch<Req, Res>(`${prefix}${path}`, data, init),
      delete: <Res>(path: string, init?: ApiRequestOptions) => client.delete<Res>(`${prefix}${path}`, init)
    }
  }
}
