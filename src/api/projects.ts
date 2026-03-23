import type { AxiosInstance } from 'axios'

export interface Project {
  project_id: string
  name: string
  client_name: string
}

export interface Wildcard {
  wildcard: string
  owner: string
}

export interface Domain {
  domain: string
  ips: string[]
}

export interface ProjectSummary {
  project_info: { name: string }
  inventory: {
    total_assets: number
    wildcards: Wildcard[]
    domains: Domain[]
  }
}

export const projectsApi = (client: AxiosInstance) => ({
  list: (): Promise<Project[]> =>
    client.get('/projects/').then((r) => r.data),

  summary: (id: string): Promise<ProjectSummary> =>
    client.get(`/projects/${id}/summary`).then((r) => r.data),
})
