import type { GetProjectsParams } from "../../infrastructure/api/projects.service"

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  list: (params: GetProjectsParams) => [...projectKeys.lists(), params] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  names: () => [...projectKeys.all, "names"] as const,
  stats: () => [...projectKeys.all, "stats"] as const
}
