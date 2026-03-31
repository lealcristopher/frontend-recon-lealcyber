import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { projectsApi, type Project, type ProjectScope, type ScopeWildcard, type ScopeDomain } from '../api/projects'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const client = useApiClient()
  const navigate = useNavigate()
  const api = projectsApi(client)

  const [project, setProject] = useState<Project | null>(null)
  const [scope, setScope] = useState<ProjectScope | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // scope add/delete state
  const [wildcardInput, setWildcardInput] = useState('')
  const [domainInput, setDomainInput] = useState('')
  const [wildcardError, setWildcardError] = useState<string | null>(null)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const projectId = id ? Number(id) : null

  function loadScope(pid: number) {
    return api.scope(pid).then(setScope)
  }

  useEffect(() => {
    if (!projectId) return
    Promise.all([api.get(projectId), api.scope(projectId)])
      .then(([p, s]) => { setProject(p); setScope(s) })
      .catch((err: unknown) => {
        const status = (err as { response?: { status: number } })?.response?.status
        if (status === 403) setError('Sem acesso a este projeto.')
        else if (status === 404) setError('Projeto não encontrado.')
        else setError('Erro ao carregar projeto.')
      })
      .finally(() => setLoading(false))
  }, [projectId]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAddWildcard(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setWildcardError(null)
    setSaving(true)
    try {
      await api.addWildcard(projectId, wildcardInput.trim())
      setWildcardInput('')
      await loadScope(projectId)
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      setWildcardError(status === 409 ? 'Wildcard já existe neste projeto.' : 'Erro ao adicionar wildcard.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteWildcard(w: ScopeWildcard) {
    if (!projectId) return
    await api.deleteWildcard(projectId, w.id)
    await loadScope(projectId)
  }

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setDomainError(null)
    setSaving(true)
    try {
      await api.addDomain(projectId, domainInput.trim())
      setDomainInput('')
      await loadScope(projectId)
    } catch (err: unknown) {
      const status = (err as { response?: { status: number } })?.response?.status
      setDomainError(status === 409 ? 'Domínio já existe neste projeto.' : 'Erro ao adicionar domínio.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteDomain(d: ScopeDomain) {
    if (!projectId) return
    await api.deleteDomain(projectId, d.id)
    await loadScope(projectId)
  }

  async function handleDeleteProject() {
    if (!projectId || !project) return
    if (!confirm(`Deletar projeto "${project.name}"?`)) return
    await api.delete(projectId)
    navigate('/projects')
  }

  if (loading) return <p>Loading...</p>
  if (error) return (
    <div>
      <p style={{ color: '#f87171' }}>{error}</p>
      <button onClick={() => navigate('/projects')} style={btnSecondary}>← Back</button>
    </div>
  )
  if (!project || !scope) return null

  const canWrite = project.access === 'write'

  return (
    <div>
      <button onClick={() => navigate('/projects')} style={{ ...btnSecondary, marginBottom: '1rem' }}>
        ← Back
      </button>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ margin: 0 }}>{project.name}</h2>
          <span style={{ color: '#888', fontFamily: 'monospace', fontSize: '0.9rem' }}>{project.slug}</span>
          {' '}
          <span style={{ ...badge, background: canWrite ? '#166534' : '#1e3a5f', marginLeft: '0.5rem' }}>
            {project.access}
          </span>
          {' '}
          <span style={{ ...badge, background: '#444', marginLeft: '0.25rem' }}>
            {project.owner_type === 'org' ? 'Org' : 'Personal'}
          </span>
          <p style={{ color: '#888', margin: '0.5rem 0 0' }}>{scope.total_assets} assets</p>
        </div>
        {canWrite && (
          <button onClick={handleDeleteProject} style={btnDanger}>
            Delete Project
          </button>
        )}
      </div>

      {/* Wildcards */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Wildcards ({scope.wildcards.length})</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={th}>Pattern</th>
            <th style={th}>Origin</th>
            {canWrite && <th style={th}></th>}
          </tr>
        </thead>
        <tbody>
          {scope.wildcards.map((w) => (
            <tr key={w.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ ...td, fontFamily: 'monospace' }}>{w.pattern}</td>
              <td style={{ ...td, color: '#888' }}>{w.origin}</td>
              {canWrite && (
                <td style={td}>
                  <button onClick={() => handleDeleteWildcard(w)} style={btnDangerSm}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {scope.wildcards.length === 0 && (
            <tr><td colSpan={canWrite ? 3 : 2} style={{ ...td, color: '#555' }}>No wildcards.</td></tr>
          )}
        </tbody>
      </table>
      {canWrite && (
        <form onSubmit={handleAddWildcard} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'center' }}>
          <input
            placeholder="*.example.com"
            value={wildcardInput}
            onChange={(e) => setWildcardInput(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" disabled={saving} style={btnPrimary}>
            Add Wildcard
          </button>
          {wildcardError && <span style={{ color: '#f87171', fontSize: '0.85rem' }}>{wildcardError}</span>}
        </form>
      )}

      {/* Domains */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Domains ({scope.domains.length})</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={th}>Domain</th>
            <th style={th}>IPs</th>
            <th style={th}>CNAMEs</th>
            <th style={th}>Origin</th>
            {canWrite && <th style={th}></th>}
          </tr>
        </thead>
        <tbody>
          {scope.domains.map((d) => (
            <tr key={d.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ ...td, fontFamily: 'monospace' }}>{d.domain}</td>
              <td style={{ ...td, color: '#888' }}>{d.ips.length > 0 ? d.ips.join(', ') : '—'}</td>
              <td style={{ ...td, color: '#888' }}>{d.cnames.length > 0 ? d.cnames.join(', ') : '—'}</td>
              <td style={{ ...td, color: '#888' }}>{d.origin}</td>
              {canWrite && (
                <td style={td}>
                  <button onClick={() => handleDeleteDomain(d)} style={btnDangerSm}>
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
          {scope.domains.length === 0 && (
            <tr><td colSpan={canWrite ? 5 : 4} style={{ ...td, color: '#555' }}>No domains.</td></tr>
          )}
        </tbody>
      </table>
      {canWrite && (
        <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            placeholder="api.example.com"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            required
            style={{ ...inputStyle, flex: 1 }}
          />
          <button type="submit" disabled={saving} style={btnPrimary}>
            Add Domain
          </button>
          {domainError && <span style={{ color: '#f87171', fontSize: '0.85rem' }}>{domainError}</span>}
        </form>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.5rem 1rem' }
const td: React.CSSProperties = { padding: '0.5rem 1rem' }
const badge: React.CSSProperties = { padding: '0.15rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', color: '#fff' }
const inputStyle: React.CSSProperties = { padding: '0.4rem 0.6rem', background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }
const btnPrimary: React.CSSProperties = { padding: '0.4rem 0.9rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { padding: '0.4rem 0.9rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const btnDanger: React.CSSProperties = { padding: '0.4rem 0.9rem', background: '#991b1b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const btnDangerSm: React.CSSProperties = { padding: '0.2rem 0.6rem', background: '#7f1d1d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }
