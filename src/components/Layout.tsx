import { NavLink, Outlet } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'

export default function Layout() {
  const { user, logout } = useAuth0()

  return (
    <div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #333' }}>
        <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>Leal Cyber Recon</span>
        <NavLink to="/projects">Projects</NavLink>
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
