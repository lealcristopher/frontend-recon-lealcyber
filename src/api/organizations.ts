import type { AxiosInstance } from 'axios'

export interface Organization {
  id: number
  name: string
  slug: string
  role: 'admin' | 'member'
}

export interface Member {
  usuario_id: number
  email: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface Invitation {
  id: number
  email: string
  status: string
  created_at: string
}

export const organizationsApi = (client: AxiosInstance) => ({
  list: (): Promise<Organization[]> =>
    client.get('/organizations/').then((r) => r.data),

  create: (name: string, slug: string): Promise<Organization> =>
    client.post('/organizations/', { name, slug }).then((r) => r.data),

  getMembers: (id: number): Promise<Member[]> =>
    client.get(`/organizations/${id}/members`).then((r) => r.data),

  getInvitations: (id: number): Promise<Invitation[]> =>
    client.get(`/organizations/${id}/invitations`).then((r) => r.data),

  invite: (id: number, email: string): Promise<Invitation> =>
    client.post(`/organizations/${id}/invitations`, { email }).then((r) => r.data),

  acceptInvite: (token: string): Promise<{ message: string; organization_id: number }> =>
    client.post(`/organizations/invitations/${token}/accept`).then((r) => r.data),

  removeMember: (orgId: number, userId: number): Promise<void> =>
    client.delete(`/organizations/${orgId}/members/${userId}`).then((r) => r.data),

  revokeInvitation: (orgId: number, invId: number): Promise<void> =>
    client.delete(`/organizations/${orgId}/invitations/${invId}`).then((r) => r.data),
})
