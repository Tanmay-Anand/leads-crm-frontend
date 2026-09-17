/**
 * Holds the active tenant for the session.
 *
 * The reference calls this the builder session, and a platform user picks a builder on a dedicated
 * screen before the app becomes usable. Here it is seeded from the signed-in user custom:tenantId
 * claim, which is what a tenant-scoped user always has; the setter exists so a platform user could
 * be pointed at a tenant without the API client changing.
 *
 * Kept in localStorage rather than memory so a reload does not drop the tenant and send the next
 * request without the header.
 */

const STORAGE_KEY = "leads-crm.tenantId"

export const tenantSession = {
  getTenantId(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      // Private browsing and blocked site data both throw on access rather than returning null.
      return null
    }
  },

  setTenantId(tenantId: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, tenantId)
    } catch {
      // Not being able to remember the tenant is survivable: the JWT claim still carries it.
    }
  },

  clearTenantId(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore.
    }
  }
}
