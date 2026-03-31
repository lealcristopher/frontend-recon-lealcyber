import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { projectsApi, type Project, type CreateProjectPayload } from '../api/projects'
import { useHasRole } from '../hooks/useRoles'
import { useOrgContext } from '../context/OrgContext'

function NewProjectModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const client = useApiClient()
  const { orgs } = useOrgContext()
  const isAdmin = useHasRole('recon-organization-admin')
  const adminOrgs = orgs.filter((o) => o.role === 'admin')

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [orgId, setOrgId] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)
    const payload: CreateProjectPayload = { name, slug }
    if (isAdmin && orgId !== '') payload.organization_id = orgId as number
    try {
      await projectsApi(client).create(payload)
      onCreated()
      onClose()
    } catch (err: unknown) {
      const status = (err as { response?: { status: number; data?: { detail?: string } } })?.response?.status
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      if (status === 409) setError('Slug já em uso neste projeto ou organização.')
      else if (status === 403) setError(detail ?? 'Sem permissão para criar este projeto.')
      else setError('Erro ao criar projeto.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3 style={{ marginTop: 0 }}>New Project</h3>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label>Name</label>
            <input
              placeholder="My Project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          <div style={fieldStyle}>
            <label>Slug</label>
            <input
              placeholder="my-project"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              style={inputStyle}
            />
          </div>
          {isAdmin && adminOrgs.length > 0 && (
            <div style={fieldStyle}>
              <label>Organization (optional)</label>
              <select
                value={orgId}
                onChange={(e) => setOrgId(e.target.value === '' ? '' : Number(e.target.value))}
                style={inputStyle}
              >
                <option value="">— Personal project —</option>
                {adminOrgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {error && <p style={{ color: '#f87171', margin: '0.5rem 0' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={btnPrimary}>
              {saving ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const client = useApiClient()
  const navigate = useNavigate()
  const isAdmin = useHasRole('recon-organization-admin')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  function load() {
    setLoading(true)
    projectsApi(client)
      .list()
      .then(setProjects)
      .catch((e: unknown) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [client])

  if (loading) return <p>Loading projects...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Projects</h2>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} style={btnPrimary}>
            + New Project
          </button>
        )}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={th}>Name</th>
            <th style={th}>Slug</th>
            <th style={th}>Type</th>
            <th style={th}>Access</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr
              key={p.id}
              onClick={() => navigate(`/projects/${p.id}`)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #222' }}
            >
              <td style={td}>{p.name}</td>
              <td style={{ ...td, color: '#888', fontFamily: 'monospace' }}>{p.slug}</td>
              <td style={td}>{p.owner_type === 'org' ? 'Org' : 'Personal'}</td>
              <td style={td}>
                <span style={{ ...badge, background: p.access === 'write' ? '#166534' : '#1e3a5f' }}>
                  {p.access}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {projects.length === 0 && <p style={{ color: '#888' }}>No projects found.</p>}

      {showModal && (
        <NewProjectModal onClose={() => setShowModal(false)} onCreated={load} />
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '0.5rem 1rem' }
const td: React.CSSProperties = { padding: '0.5rem 1rem' }
const badge: React.CSSProperties = {
  padding: '0.15rem 0.5rem',
  borderRadius: '4px',
  fontSize: '0.8rem',
  color: '#fff',
}
const fieldStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.75rem' }
const inputStyle: React.CSSProperties = { padding: '0.4rem 0.6rem', background: '#1a1a1a', color: '#fff', border: '1px solid #444', borderRadius: '4px' }
const btnPrimary: React.CSSProperties = { padding: '0.4rem 0.9rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const btnSecondary: React.CSSProperties = { padding: '0.4rem 0.9rem', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const modal: React.CSSProperties = { background: '#111', border: '1px solid #333', borderRadius: '8px', padding: '1.5rem', width: '400px', maxWidth: '90vw' }
