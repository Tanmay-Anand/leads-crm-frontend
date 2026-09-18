import { api } from "@/infrastructure/http/api.client"
import { buildListQuery, createSearchFieldMapper } from "@/shared/lib/utils"
import type { Paginated } from "@/shared/types/api"

import type { UserDto, UserNamesDto, UserRequest, UserSearchField } from "../../domain/types"

const usersApi = api.getService("users")

/** Toolbar field ids to the backend UserSearchField enum. */
const SEARCH_FIELD_TO_ENUM: Record<string, UserSearchField> = {
  email: "EMAIL",
  firstName: "FIRST_NAME",
  lastName: "LAST_NAME"
}

export const toUserSearchFields = createSearchFieldMapper(SEARCH_FIELD_TO_ENUM)

export interface GetUsersParams {
  page?: number
  size?: number
  sort?: string
  q?: string
  searchFields?: UserSearchField[]
  enabled?: boolean
  role?: string
  customRoleId?: string
}

export const usersService = {
  getUsers: (params: GetUsersParams): Promise<Paginated<UserDto>> => usersApi.get(buildListQuery(params)),

  getNames: (): Promise<UserNamesDto[]> => usersApi.get("/names"),

  getUser: (id: string): Promise<UserDto> => usersApi.get(`/${id}`),

  createUser: (data: UserRequest): Promise<UserDto> => usersApi.post("", data),

  updateUser: (id: string, data: UserDto): Promise<UserDto> => usersApi.put(`/${id}`, data),

  setStatus: (id: string, enabled: boolean): Promise<UserDto> => usersApi.patch(`/${id}/status`, { enabled }),

  resetPassword: (id: string, password: string): Promise<void> => usersApi.patch(`/${id}/password`, { password }),

  deleteUser: (id: string): Promise<void> => usersApi.delete(`/${id}`)
}
