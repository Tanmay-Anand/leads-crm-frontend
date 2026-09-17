import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

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
  validateSearch: projectsSearchSchema,
  component: ProjectsPage
})
