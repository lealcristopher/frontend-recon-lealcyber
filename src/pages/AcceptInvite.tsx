import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useApiClient } from '../api/client'
import { organizationsApi, type InvitePreview } from '../api/organizations'

export default function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const client = useApiClient()
  const { user, logout } = useAuth0()
  const navigate = useNavigate()

  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(() => !!token)
  const [previewInvalid, setPreviewInvalid] = useState(false)

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    organizationsApi(client).previewInvite(token)
      .then(setPreview)
      .catch(() => setPreviewInvalid(true))
      .finally(() => setPreviewLoading(false))
  }, [client, token])

  if (!token) {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Link inválido</h2>
        <p style={{ color: '#888' }}>O link de convite não contém um token.</p>
      </div>
    )
  }

  if (previewLoading) return <p style={{ textAlign: 'center', marginTop: '4rem' }}>Carregando convite...</p>

  if (previewInvalid) {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Convite inválido</h2>
        <p style={{ color: '#888' }}>Este convite não existe, já foi aceito ou foi revogado.</p>
      </div>
    )
  }

  const wrongAccount = preview && user?.email &&
    preview.email.toLowerCase() !== user.email.toLowerCase()

  if (wrongAccount) {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Conta incorreta</h2>
        <p style={{ marginBottom: '0.5rem' }}>
          Este convite foi enviado para <strong>{preview!.email}</strong>.
        </p>
        <p style={{ color: '#888', marginBottom: '1.5rem' }}>
          Você está logado como <strong>{user?.email}</strong>. Saia e entre com a conta correta para aceitar o convite.
        </p>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.href } })}
          style={{ padding: '0.6rem 1.5rem' }}
        >
          Sair e trocar de conta
        </button>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div style={{ maxWidth: '420px', margin: '4rem auto', textAlign: 'center' }}>
        <h2>Bem-vindo!</h2>
        <p>Você entrou para a organização <strong>{preview?.org_name}</strong>.</p>
        <button onClick={() => navigate('/organizations')} style={{ padding: '0.6rem 1.5rem' }}>
          Ver organizações →
        </button>
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

  return (
    <div style={{ maxWidth: '420px', margin: '4rem auto', textAlign: 'center' }}>
      <h2>Convite para {preview?.org_name}</h2>
      <p style={{ color: '#888', marginBottom: '0.25rem' }}>
        Você foi convidado para a organização <strong>{preview?.org_name}</strong>.
      </p>
      <p style={{ color: '#888', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Aceitando como <strong>{user?.email}</strong>
      </p>

      {status === 'error' && (
        <p style={{ color: 'salmon', marginBottom: '1rem' }}>{errorMessage}</p>
      )}

      <button onClick={handleAccept} disabled={status === 'loading'} style={{ padding: '0.6rem 1.5rem' }}>
        {status === 'loading' ? 'Aceitando...' : 'Aceitar convite'}
      </button>
    </div>
  )
}
