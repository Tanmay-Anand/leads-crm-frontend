import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

import { requireRoutePermission } from "@/domains/authorization/application/route-guards"
import ProjectsPage from "@/domains/project/presentation/pages/projects-page"

const projectsSearchSchema = z.object({
  page: z.coerce.number().optional(),
  size: z.coerce.number().optional(),
  sort: z.string().optional(),
  search: z.coerce.string().optional(),
  searchFields: z.coerce.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional()
})

export const Route = createFileRoute("/_protected/projects/")({
  beforeLoad: ({ context }) => {
    if (!requireRoutePermission(context.queryClient, "view", "projects")) {
      throw redirect({ to: "/forbidden" })
    }
  },
  validateSearch: projectsSearchSchema,
  component: ProjectsPage
})
