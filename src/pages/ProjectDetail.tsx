import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { projectsApi, type ProjectSummary } from '../api/projects'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const client = useApiClient()
  const navigate = useNavigate()
  const [summary, setSummary] = useState<ProjectSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    projectsApi(client)
      .summary(decodeURIComponent(id))
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [client, id])

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  if (!summary) return null

  const { project_info, inventory } = summary

  return (
    <div>
      <button onClick={() => navigate('/projects')} style={{ marginBottom: '1rem' }}>
        ← Back
      </button>
      <h2>{project_info.name}</h2>
      <p style={{ color: '#888' }}>Total assets: {inventory.total_assets}</p>

      <h3>Wildcards ({inventory.wildcards.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={{ padding: '0.5rem 1rem' }}>Wildcard</th>
            <th style={{ padding: '0.5rem 1rem' }}>Owner</th>
          </tr>
        </thead>
        <tbody>
          {inventory.wildcards.map((w) => (
            <tr key={w.wildcard} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5rem 1rem', fontFamily: 'monospace' }}>{w.wildcard}</td>
              <td style={{ padding: '0.5rem 1rem', color: '#888' }}>{w.owner}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Domains ({inventory.domains.length})</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={{ padding: '0.5rem 1rem' }}>Domain</th>
            <th style={{ padding: '0.5rem 1rem' }}>IPs</th>
          </tr>
        </thead>
        <tbody>
          {inventory.domains.map((d) => (
            <tr key={d.domain} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5rem 1rem', fontFamily: 'monospace' }}>{d.domain}</td>
              <td style={{ padding: '0.5rem 1rem', color: '#888' }}>
                {d.ips.length > 0 ? d.ips.join(', ') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
