import { createFileRoute, redirect } from "@tanstack/react-router"

/** Leads is the home of this CRM, so the root just forwards there. */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/leads" })
  }
})
