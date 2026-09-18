import { api } from "@/infrastructure/http/api.client"

import type { PermissionCatalogResponse, RoleRequest, RoleResponse } from "../../domain/types"

const rolesApi = api.getService("roles")
const permissionsApi = api.getService("permissions")

export const rolesService = {
  getCatalog: (): Promise<PermissionCatalogResponse> => permissionsApi.get("/catalog"),

  getRoles: (): Promise<RoleResponse[]> => rolesApi.get(),

  getRole: (id: string): Promise<RoleResponse> => rolesApi.get(`/${id}`),

  createRole: (data: RoleRequest): Promise<RoleResponse> => rolesApi.post("", data),

  updateRole: (id: string, data: RoleRequest): Promise<RoleResponse> => rolesApi.put(`/${id}`, data),

  deleteRole: (id: string): Promise<void> => rolesApi.delete(`/${id}`)
}
