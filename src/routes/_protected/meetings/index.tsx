import { createFileRoute } from "@tanstack/react-router"

import MeetingsPage from "@/domains/meetings/presentation/pages/meetings-page"

export const Route = createFileRoute("/_protected/meetings/")({
  component: MeetingsPage
})
