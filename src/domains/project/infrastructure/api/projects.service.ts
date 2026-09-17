import { api } from "@/infrastructure/http/api.client"
import { buildListQuery, createSearchFieldMapper } from "@/shared/lib/utils"
import type { Paginated } from "@/shared/types/api"

import type { ProjectDto, ProjectNamesDto, ProjectSearchField, ProjectStatsDto } from "../../domain/types"

const projectsApi = api.getService("projects")

/** Toolbar field ids to the backend ProjectSearchField enum. */
const SEARCH_FIELD_TO_ENUM: Record<string, ProjectSearchField> = {
  name: "NAME",
  brand: "BRAND",
  city: "CITY",
  state: "STATE",
  microMarket: "MICRO_MARKET",
  reraNumber: "RERA_NUMBER",
  projectType: "PROJECT_TYPE",
  projectStage: "PROJECT_STAGE"
}

export const toProjectSearchFields = createSearchFieldMapper(SEARCH_FIELD_TO_ENUM)

export interface GetProjectsParams {
  page?: number
  size?: number
  sort?: string
  q?: string
  searchFields?: ProjectSearchField[]
  fromDate?: string
  toDate?: string
}

export const projectsService = {
  getProjects: (params: GetProjectsParams): Promise<Paginated<ProjectDto>> =>
    projectsApi.get(buildListQuery(params)),

  getNames: (): Promise<ProjectNamesDto[]> => projectsApi.get("/names"),

  getStats: (): Promise<ProjectStatsDto> => projectsApi.get("/stats"),

  getProject: (id: string): Promise<ProjectDto> => projectsApi.get(`/${id}`),

  createProject: (data: ProjectDto): Promise<ProjectDto> => projectsApi.post("", data),

  updateProject: (id: string, data: ProjectDto): Promise<ProjectDto> => projectsApi.put(`/${id}`, data),

  deleteProject: (id: string): Promise<void> => projectsApi.delete(`/${id}`)
}
