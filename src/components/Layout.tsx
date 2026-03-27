import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from '../api/client'
import { organizationsApi } from '../api/organizations'
import { useOrgContext } from '../context/OrgContext'

export default function Layout() {
  const { user, logout } = useAuth0()
  const client = useApiClient()
  const { activeOrg, setActiveOrg, orgs, setOrgs } = useOrgContext()

  useEffect(() => {
    organizationsApi(client).list().then(setOrgs).catch(() => {})
  }, [client]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #333' }}>
        <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>Leal Cyber Recon</span>
        <NavLink to="/projects">Projects</NavLink>
        <NavLink to="/organizations">Organizations</NavLink>
        {orgs.length > 0 && (
          <select
            value={activeOrg?.id ?? ''}
            onChange={(e) => {
              const org = orgs.find((o) => String(o.id) === e.target.value) ?? null
              setActiveOrg(org)
            }}
            style={{ padding: '0.2rem 0.4rem', fontSize: '0.85rem' }}
          >
            <option value="">— no org —</option>
            {orgs.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        )}
        <span style={{ color: '#888' }}>{user?.email}</span>
        <button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
          Logout
        </button>
      </nav>
      <main style={{ padding: '2rem' }}>
        <Outlet />
      </main>
    </div>
  )
}
