import { createFileRoute } from "@tanstack/react-router"
import { ShieldAlert } from "lucide-react"

/** Inside `_protected`, not above it, so the sidebar/navbar shell survives a denied route. */
export const Route = createFileRoute("/_protected/forbidden")({
  component: ForbiddenPage
})

function ForbiddenPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
      <ShieldAlert className="text-muted-foreground size-10" />
      <h1 className="text-lg font-semibold">You don't have access to this page</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ask an administrator to grant you the permission this screen needs.
      </p>
    </div>
  )
}
