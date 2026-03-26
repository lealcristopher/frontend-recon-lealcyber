import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useApiClient } from '../api/client'
import { organizationsApi } from '../api/organizations'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const client = useApiClient()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Invalid invitation link</h2>
        <p style={{ color: '#888' }}>The link you followed is missing the invitation token.</p>
        <Link to="/organizations">Go to Organizations</Link>
      </div>
    )
  }

  async function handleAccept() {
    setStatus('loading')
    try {
      await organizationsApi(client).acceptInvite(token!)
      setStatus('success')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Erro ao aceitar convite'
      setErrorMessage(msg)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>You're in!</h2>
        <p>You've successfully joined the organization.</p>
        <Link to="/organizations">Go to your organizations →</Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <h2>Organization Invite</h2>
      <p style={{ color: '#888', marginBottom: '1.5rem' }}>
        You've been invited to join an organization on Leal Cyber Recon.
      </p>

      {status === 'error' && (
        <p style={{ color: 'salmon', marginBottom: '1rem' }}>{errorMessage}</p>
      )}

      <button onClick={handleAccept} disabled={status === 'loading'} style={{ padding: '0.6rem 1.5rem' }}>
        {status === 'loading' ? 'Accepting...' : 'Accept Invitation'}
      </button>
    </div>
  )
}
