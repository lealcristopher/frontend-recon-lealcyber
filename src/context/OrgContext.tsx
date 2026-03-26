import { createContext, useContext, useState, type ReactNode } from 'react'
import type { Organization } from '../api/organizations'

interface OrgContextValue {
  activeOrg: Organization | null
  setActiveOrg: (org: Organization | null) => void
  orgs: Organization[]
  setOrgs: (orgs: Organization[]) => void
}

const OrgContext = createContext<OrgContextValue | null>(null)

const STORAGE_KEY = 'lc_active_org'

export function OrgProvider({ children }: { children: ReactNode }) {
  const [activeOrg, _setActiveOrg] = useState<Organization | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [orgs, setOrgs] = useState<Organization[]>([])

  function setActiveOrg(org: Organization | null) {
    _setActiveOrg(org)
    if (org) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(org))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  return (
    <OrgContext.Provider value={{ activeOrg, setActiveOrg, orgs, setOrgs }}>
      {children}
    </OrgContext.Provider>
  )
}

export function useOrgContext(): OrgContextValue {
  const ctx = useContext(OrgContext)
  if (!ctx) throw new Error('useOrgContext must be used inside OrgProvider')
  return ctx
}
