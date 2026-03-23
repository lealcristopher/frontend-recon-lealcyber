import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { projectsApi, type Project } from '../api/projects'

export default function Projects() {
  const client = useApiClient()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    projectsApi(client)
      .list()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [client])

  if (loading) return <p>Loading projects...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <h2>Projects</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={{ padding: '0.5rem 1rem' }}>Name</th>
            <th style={{ padding: '0.5rem 1rem' }}>Client</th>
            <th style={{ padding: '0.5rem 1rem' }}>ID</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.project_id}
              onClick={() => navigate(`/projects/${encodeURIComponent(p.project_id)}`)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #222' }}
            >
              <td style={{ padding: '0.5rem 1rem' }}>{p.name}</td>
              <td style={{ padding: '0.5rem 1rem' }}>{p.client_name}</td>
              <td style={{ padding: '0.5rem 1rem', color: '#888', fontSize: '0.85rem' }}>{p.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {projects.length === 0 && <p style={{ color: '#888' }}>No projects found.</p>}
    </div>
  )
}
