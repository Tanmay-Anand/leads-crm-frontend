import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import type { ProjectDto } from "../../domain/types"
import { projectsService, type GetProjectsParams } from "../../infrastructure/api/projects.service"

import { projectKeys } from "./projects.keys"

export const useProjectsPaginated = (params: GetProjectsParams) =>
  useQuery({
    queryKey: projectKeys.list(params),
    queryFn: () => projectsService.getProjects(params),
    // Keeps the previous page on screen while the next one loads, so paging does not flash empty.
    placeholderData: previous => previous
  })

/**
 * Id and name pairs, for the project picker on the lead form.
 *
 * Held for the session: projects are created rarely, and this is read on every lead dialog open.
 */
export const useProjectNames = () =>
  useQuery({
    queryKey: projectKeys.names(),
    queryFn: projectsService.getNames,
    staleTime: 5 * 60 * 1_000
  })

export const useProjectStats = () =>
  useQuery({
    queryKey: projectKeys.stats(),
    queryFn: projectsService.getStats
  })

export const useProject = (id?: string) =>
  useQuery({
    queryKey: projectKeys.detail(id ?? ""),
    queryFn: () => projectsService.getProject(id!),
    enabled: Boolean(id)
  })

const useInvalidateProjects = () => {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: projectKeys.lists() })
    void queryClient.invalidateQueries({ queryKey: projectKeys.names() })
    void queryClient.invalidateQueries({ queryKey: projectKeys.stats() })
  }
}

export const useCreateProject = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (data: ProjectDto) => projectsService.createProject(data),
    onSuccess: project => {
      toast.success(`Project ${project.name} created`)
      invalidate()
    }
  })
}

export const useUpdateProject = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectDto }) => projectsService.updateProject(id, data),
    onSuccess: () => {
      toast.success("Project updated")
      invalidate()
    }
  })
}

export const useDeleteProject = () => {
  const invalidate = useInvalidateProjects()
  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: () => {
      toast.success("Project deleted")
      invalidate()
    }
  })
}
