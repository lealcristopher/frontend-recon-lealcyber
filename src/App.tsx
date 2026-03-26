import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Layout from './components/Layout'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Organizations from './pages/Organizations'
import OrgDetail from './pages/OrgDetail'
import AcceptInvite from './pages/AcceptInvite'
import { OrgProvider } from './context/OrgContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0()

  if (isLoading) return <p>Loading...</p>
  if (!isAuthenticated) {
    loginWithRedirect()
    return null
  }
  return <>{children}</>
}

export default function App() {
  return (
    <OrgProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="organizations" element={<Organizations />} />
            <Route path="organizations/:id" element={<OrgDetail />} />
            <Route path="accept-invite" element={<AcceptInvite />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </OrgProvider>
  )
}
