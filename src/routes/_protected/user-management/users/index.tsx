import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { requireRoutePermission } from "@/domains/authorization/application/route-guards"
import UsersPage from "@/domains/user-management/presentation/pages/users-page"

const usersSearchSchema = z.object({
  page: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  sort: z.string().optional(),
  search: z.coerce.string().optional(),
  searchFields: z.coerce.string().optional()
})

export const Route = createFileRoute("/_protected/user-management/users/")({
  beforeLoad: ({ context }) => {
    if (!requireRoutePermission(context.queryClient, "view", "users")) {
      throw redirect({ to: "/forbidden" })
    }
  },
  validateSearch: usersSearchSchema,
  component: UsersPage
})
