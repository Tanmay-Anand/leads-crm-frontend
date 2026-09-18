export interface RoleResponse {
  id: string
  name: string
  permissions: string[]
  isSystem: boolean
  /** How many users currently hold this as their custom role. */
  userCount: number
  created?: string | null
  createdBy?: string | null
  modified?: string | null
  lastModifiedBy?: string | null
}

export interface RoleRequest {
  name: string
  permissions: string[]
}

/** GET /permissions/catalog - the matrix renders from this, never from a hardcoded list, so a
 *  backend addition becomes assignable immediately with no client change. */
export interface PermissionCatalogResponse {
  actions: string[]
  resources: PermissionCatalogResource[]
}

export interface PermissionCatalogResource {
  key: string
  actions: string[]
  /** Directly-nested resource keys, e.g. "master-data" -> ["master-data/lead-statuses", ...]. */
  children: string[]
}
