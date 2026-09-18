import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { usersService, type GetUsersParams } from "../../infrastructure/api/users.service"

import { userKeys } from "./users.keys"

import type { UserDto, UserRequest } from "../../domain/types"

export const useUsersPaginated = (params: GetUsersParams) =>
  useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => usersService.getUsers(params),
    // Keeps the previous page on screen while the next one loads, so paging does not flash empty.
    placeholderData: previous => previous
  })

/** Id and display-name pairs, for the lead assignee dropdown. Held for the session: users are
 *  created rarely, and this is read on every lead form open. */
export const useUserNames = () =>
  useQuery({
    queryKey: userKeys.names(),
    queryFn: usersService.getNames,
    staleTime: 5 * 60 * 1_000
  })

export const useUser = (id?: string) =>
  useQuery({
    queryKey: userKeys.detail(id ?? ""),
    queryFn: () => usersService.getUser(id!),
    enabled: Boolean(id)
  })

const useInvalidateUsers = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: userKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: userKeys.names() })
  }
}

export const useCreateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (data: UserRequest) => usersService.createUser(data),
    onSuccess: user => {
      toast.success(`User ${user.displayName || user.email} created`)
      invalidate()
    }
  })
}

export const useUpdateUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserDto }) => usersService.updateUser(id, data),
    onSuccess: () => {
      toast.success("User updated")
      invalidate()
    }
  })
}

export const useSetUserStatus = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => usersService.setStatus(id, enabled),
    onSuccess: (_, { enabled }) => {
      toast.success(enabled ? "User activated" : "User deactivated")
      invalidate()
    }
  })
}

export const useResetPassword = () =>
  useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) => usersService.resetPassword(id, password),
    onSuccess: () => {
      toast.success("Password reset")
    }
  })

export const useDeleteUser = () => {
  const invalidate = useInvalidateUsers()
  return useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted")
      invalidate()
    }
  })
}
