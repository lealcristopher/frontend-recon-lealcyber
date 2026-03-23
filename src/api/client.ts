import axios from 'axios'
import { useAuth0 } from '@auth0/auth0-react'
import { useMemo } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL as string
const AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE as string

export function useApiClient() {
  const { getAccessTokenSilently } = useAuth0()

  return useMemo(() => {
    const instance = axios.create({ baseURL: BASE_URL })

    instance.interceptors.request.use(async (config) => {
      const token = await getAccessTokenSilently({ authorizationParams: { audience: AUDIENCE } })
      config.headers.Authorization = `Bearer ${token}`
      return config
    })

    return instance
  }, [getAccessTokenSilently])
}
