import { useAuth0 } from '@auth0/auth0-react'

const ROLES_CLAIM = 'https://lealcyber.com/roles'

export function useRoles(): string[] {
  const { user } = useAuth0()
  return (user?.[ROLES_CLAIM] as string[] | undefined) ?? []
}

export function useHasRole(role: string): boolean {
  return useRoles().includes(role)
}
