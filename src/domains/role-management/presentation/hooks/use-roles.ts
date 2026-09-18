import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authorizationKeys } from "@/domains/authorization/presentation/hooks/authorization.keys"

import { rolesService } from "../../infrastructure/api/roles.service"

import { roleKeys } from "./roles.keys"

import type { RoleRequest } from "../../domain/types"

/** Rarely changes and every role screen needs it, so it is held for the session. */
export const useCatalog = () =>
  useQuery({
    queryKey: roleKeys.catalog(),
    queryFn: rolesService.getCatalog,
    staleTime: 5 * 60 * 1_000
  })

export const useRoles = () =>
  useQuery({
    queryKey: roleKeys.lists(),
    queryFn: rolesService.getRoles
  })

export const useRole = (id?: string) =>
  useQuery({
    queryKey: roleKeys.detail(id ?? ""),
    queryFn: () => rolesService.getRole(id!),
    enabled: Boolean(id)
  })

const useInvalidateRoles = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: roleKeys.lists() })
    // A role edit can narrow or widen what its holders can do right now (the backend evicts its
    // own cache after commit) - the signed-in user's own /me may be one of them.
    void queryClient.invalidateQueries({ queryKey: authorizationKeys.me() })
  }
}

export const useCreateRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: (data: RoleRequest) => rolesService.createRole(data),
    onSuccess: role => {
      toast.success(`Role ${role.name} created`)
      invalidate()
    }
  })
}

export const useUpdateRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: RoleRequest }) => rolesService.updateRole(id, data),
    onSuccess: () => {
      toast.success("Role updated")
      invalidate()
    }
  })
}

export const useDeleteRole = () => {
  const invalidate = useInvalidateRoles()
  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id),
    onSuccess: () => {
      toast.success("Role deleted")
      invalidate()
    }
  })
}
