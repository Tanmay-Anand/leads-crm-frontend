import type { GetUsersParams } from "../../infrastructure/api/users.service"

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: GetUsersParams) => [...userKeys.lists(), params] as const,
  detail: (id: string) => [...userKeys.all, "detail", id] as const,
  names: () => [...userKeys.all, "names"] as const
}
