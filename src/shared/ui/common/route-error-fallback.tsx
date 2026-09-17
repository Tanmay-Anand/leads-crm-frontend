import { Link } from "@tanstack/react-router"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/shared/ui/button"

/**
 * Last stop for an error thrown while a route renders or loads.
 *
 * Shows the message but not the stack: a route error is routinely a rejected API call, whose
 * message is already written for a user.
 */
export function RouteErrorFallback({ error }: { error?: unknown }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
      <AlertTriangle className="text-destructive size-8" />
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        {error instanceof Error ? error.message : "This page could not be loaded."}
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/leads">Back to leads</Link>
      </Button>
    </div>
  )
}
