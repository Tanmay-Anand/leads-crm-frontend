import { createFileRoute, redirect } from "@tanstack/react-router"

/**
 * Unreachable, not deleted. Channel Partners tracks external broker/agency partners referring
 * leads to a developer - it does not apply when the tenant itself is the broker/channel partner,
 * which every tenant using this product currently is. The feature (page, API, permission) is left
 * intact rather than removed, in case a future tenant's business model needs it; this is only a
 * routing-level hide, not a permission gate, so even a Tenant Admin (who bypasses permission
 * checks entirely) cannot reach it through the URL either.
 */
export const Route = createFileRoute("/_protected/channel-partners/")({
  beforeLoad: () => {
    throw redirect({ to: "/leads" })
  }
})
