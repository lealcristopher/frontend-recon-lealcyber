import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { organizationsApi, type Organization } from '../api/organizations'
import { useOrgContext } from '../context/OrgContext'
import { useHasRole } from '../hooks/useRoles'

export default function Organizations() {
  const client = useApiClient()
  const navigate = useNavigate()
  const { activeOrg, setActiveOrg, setOrgs } = useOrgContext()
  const isAdmin = useHasRole('recon-organization-admin')

  const [orgs, setLocalOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    organizationsApi(client)
      .list()
      .then((data) => {
        setLocalOrgs(data)
        setOrgs(data)
        // Limpa activeOrg se não está mais na lista
        if (activeOrg && !data.find((o) => o.id === activeOrg.id)) {
          setActiveOrg(null)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [client]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const org = await organizationsApi(client).create(newName, newSlug)
      const updated = [...orgs, org]
      setLocalOrgs(updated)
      setOrgs(updated)
      setShowCreate(false)
      setNewName('')
      setNewSlug('')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao criar organização'
      setCreateError(msg)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <p>Loading organizations...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Organizations</h2>
        {isAdmin && (
          <button onClick={() => setShowCreate(!showCreate)}>
            {showCreate ? 'Cancel' : '+ New Organization'}
          </button>
        )}
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>Name</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Acme Corp"
              required
              style={{ padding: '0.4rem 0.6rem' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#888' }}>Slug</label>
            <input
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              placeholder="acme-corp"
              required
              style={{ padding: '0.4rem 0.6rem' }}
            />
          </div>
          <button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create'}
          </button>
          {createError && <span style={{ color: 'salmon' }}>{createError}</span>}
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #333' }}>
            <th style={{ padding: '0.5rem 1rem' }}>Name</th>
            <th style={{ padding: '0.5rem 1rem' }}>Slug</th>
            <th style={{ padding: '0.5rem 1rem' }}>Your Role</th>
          </tr>
        </thead>
        <tbody>
          {orgs.map((org) => (
            <tr
              key={org.id}
              onClick={() => navigate(`/organizations/${org.id}`)}
              style={{ cursor: 'pointer', borderBottom: '1px solid #222' }}
            >
              <td style={{ padding: '0.5rem 1rem' }}>{org.name}</td>
              <td style={{ padding: '0.5rem 1rem', color: '#888', fontSize: '0.85rem' }}>{org.slug}</td>
              <td style={{ padding: '0.5rem 1rem' }}>{org.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {orgs.length === 0 && <p style={{ color: '#888' }}>You don't belong to any organization yet.</p>}
    </div>
  )
}
