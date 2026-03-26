import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from '../api/client'
import { organizationsApi, type Member, type Invitation } from '../api/organizations'

export default function OrgDetail() {
  const { id } = useParams<{ id: string }>()
  const orgId = Number(id)
  const client = useApiClient()
  const { user } = useAuth0()

  const [members, setMembers] = useState<Member[]>([])
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [loadingInvitations, setLoadingInvitations] = useState(true)
  const [errorMembers, setErrorMembers] = useState<string | null>(null)
  const [errorInvitations, setErrorInvitations] = useState<string | null>(null)

  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const [confirmRemove, setConfirmRemove] = useState<number | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState<number | null>(null)

  const myRole = members.find((m) => m.email === user?.email)?.role ?? null
  const isAdmin = myRole === 'admin'

  useEffect(() => {
    const api = organizationsApi(client)

    api.getMembers(orgId)
      .then(setMembers)
      .catch((e) => setErrorMembers(e.message))
      .finally(() => setLoadingMembers(false))

    api.getInvitations(orgId)
      .then(setInvitations)
      .catch((e) => setErrorInvitations(e.message))
      .finally(() => setLoadingInvitations(false))
  }, [client, orgId])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    try {
      const inv = await organizationsApi(client).invite(orgId, inviteEmail)
      setInvitations((prev) => [...prev, inv])
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao enviar convite'
      setInviteError(msg)
    } finally {
      setInviting(false)
    }
  }

  async function handleRemoveMember(userId: number) {
    try {
      await organizationsApi(client).removeMember(orgId, userId)
      setMembers((prev) => prev.filter((m) => m.usuario_id !== userId))
      setConfirmRemove(null)
    } catch (e: unknown) {
      alert((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao remover membro')
    }
  }

  async function handleRevokeInvitation(invId: number) {
    try {
      await organizationsApi(client).revokeInvitation(orgId, invId)
      setInvitations((prev) => prev.map((i) => i.id === invId ? { ...i, status: 'revoked' } : i))
      setConfirmRevoke(null)
    } catch (e: unknown) {
      alert((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao revogar convite')
    }
  }

  const tdStyle = { padding: '0.5rem 1rem' }
  const thStyle = { ...tdStyle, textAlign: 'left' as const, borderBottom: '1px solid #333' }
  const trStyle = { borderBottom: '1px solid #222' }

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <Link to="/organizations" style={{ fontSize: '0.85rem', color: '#888' }}>← Organizations</Link>
      </div>

      {/* Members */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Members</h2>
          {isAdmin && (
            <button onClick={() => { setShowInviteForm(!showInviteForm); setInviteError(null) }}>
              {showInviteForm ? 'Cancel' : '+ Invite'}
            </button>
          )}
        </div>

        {showInviteForm && (
          <form onSubmit={handleInvite} style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              required
              style={{ padding: '0.4rem 0.6rem', minWidth: '220px' }}
            />
            <button type="submit" disabled={inviting}>
              {inviting ? 'Sending...' : 'Send Invite'}
            </button>
            {inviteError && <span style={{ color: 'salmon' }}>{inviteError}</span>}
          </form>
        )}

        {loadingMembers ? <p>Loading members...</p> : errorMembers ? <p>Error: {errorMembers}</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Joined</th>
                {isAdmin && <th style={thStyle} />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.usuario_id} style={trStyle}>
                  <td style={tdStyle}>{m.email}</td>
                  <td style={tdStyle}>{m.role}</td>
                  <td style={tdStyle}>{new Date(m.joined_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      {m.email !== user?.email && (
                        confirmRemove === m.usuario_id ? (
                          <span>
                            Sure?{' '}
                            <button onClick={() => handleRemoveMember(m.usuario_id)} style={{ color: 'salmon', marginRight: '0.4rem' }}>Yes</button>
                            <button onClick={() => setConfirmRemove(null)}>No</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmRemove(m.usuario_id)}>Remove</button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loadingMembers && members.length === 0 && <p style={{ color: '#888' }}>No members.</p>}
      </div>

      {/* Invitations */}
      <div>
        <h2 style={{ marginBottom: '1rem' }}>Invitations</h2>
        {loadingInvitations ? <p>Loading invitations...</p> : errorInvitations ? <p>Error: {errorInvitations}</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Sent</th>
                {isAdmin && <th style={thStyle} />}
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv) => (
                <tr key={inv.id} style={trStyle}>
                  <td style={tdStyle}>{inv.email}</td>
                  <td style={tdStyle}>{inv.status}</td>
                  <td style={tdStyle}>{new Date(inv.created_at).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      {inv.status === 'pending' && (
                        confirmRevoke === inv.id ? (
                          <span>
                            Sure?{' '}
                            <button onClick={() => handleRevokeInvitation(inv.id)} style={{ color: 'salmon', marginRight: '0.4rem' }}>Yes</button>
                            <button onClick={() => setConfirmRevoke(null)}>No</button>
                          </span>
                        ) : (
                          <button onClick={() => setConfirmRevoke(inv.id)}>Revoke</button>
                        )
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loadingInvitations && invitations.length === 0 && <p style={{ color: '#888' }}>No invitations sent.</p>}
      </div>
    </div>
  )
}
