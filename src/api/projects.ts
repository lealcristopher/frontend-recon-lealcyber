import type { AxiosInstance } from 'axios'

export interface Project {
  id: number
  name: string
  slug: string
  description: string
  status: 'active' | 'archived'
  owner_type: 'user' | 'org'
  usuario_id: number | null
  organization_id: number | null
  access: 'read' | 'write'
  created_at: string
}

export interface ScopeWildcard {
  id: number
  pattern: string
  origin: string
  created_at: string
}

export interface ScopeDomain {
  id: number
  domain: string
  origin: string
  wildcard_id: number | null
  ips: string[]
  cnames: string[]
  last_seen: string | null
  created_at: string
}

export interface ProjectScope {
  wildcards: ScopeWildcard[]
  domains: ScopeDomain[]
  total_assets: number
}

export interface CreateProjectPayload {
  name: string
  slug: string
  description?: string
  organization_id?: number
}

export const projectsApi = (client: AxiosInstance) => ({
  list: (): Promise<Project[]> =>
    client.get('/projects/').then((r) => r.data),

  get: (id: number): Promise<Project> =>
    client.get(`/projects/${id}`).then((r) => r.data),

  create: (payload: CreateProjectPayload): Promise<Project> =>
    client.post('/projects/', payload).then((r) => r.data),

  delete: (id: number): Promise<void> =>
    client.delete(`/projects/${id}`).then((r) => r.data),

  scope: (id: number): Promise<ProjectScope> =>
    client.get(`/projects/${id}/scope`).then((r) => r.data),

  addWildcard: (projectId: number, pattern: string): Promise<ScopeWildcard> =>
    client.post(`/projects/${projectId}/scope/wildcards`, { pattern }).then((r) => r.data),

  deleteWildcard: (projectId: number, wildcardId: number): Promise<void> =>
    client.delete(`/projects/${projectId}/scope/wildcards/${wildcardId}`).then((r) => r.data),

  addDomain: (projectId: number, domain: string): Promise<ScopeDomain> =>
    client.post(`/projects/${projectId}/scope/domains`, { domain }).then((r) => r.data),

  deleteDomain: (projectId: number, domainId: number): Promise<void> =>
    client.delete(`/projects/${projectId}/scope/domains/${domainId}`).then((r) => r.data),
})
