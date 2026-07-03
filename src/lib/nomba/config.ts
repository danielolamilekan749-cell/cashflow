import type { NombaEnvironment } from './types'

const SANDBOX_URL = 'https://sandbox.nomba.com'
const PRODUCTION_URL = 'https://api.nomba.com'

/** Vite dev proxy path — avoids CORS when calling Nomba from the browser. */
export const NOMBA_API_PROXY = '/api/nomba'

export function getNombaEnvironment(): NombaEnvironment {
  return import.meta.env.VITE_NOMBA_ENV === 'production' ? 'production' : 'sandbox'
}

export function getNombaBaseUrl(): string {
  return getNombaEnvironment() === 'production' ? PRODUCTION_URL : SANDBOX_URL
}

/**
 * API requests go through the Vite proxy in development.
 * In production builds, set up a backend proxy — never ship client secrets in the bundle.
 */
export function getNombaApiBase(): string {
  if (import.meta.env.DEV) {
    return NOMBA_API_PROXY
  }
  return getNombaBaseUrl()
}

export function hasNombaCredentials(): boolean {
  return Boolean(
    import.meta.env.VITE_NOMBA_CLIENT_ID &&
      import.meta.env.VITE_NOMBA_CLIENT_SECRET &&
      import.meta.env.VITE_NOMBA_ACCOUNT_ID,
  )
}

export function getNombaCredentials() {
  return {
    clientId: import.meta.env.VITE_NOMBA_CLIENT_ID ?? '',
    clientSecret: import.meta.env.VITE_NOMBA_CLIENT_SECRET ?? '',
    accountId: import.meta.env.VITE_NOMBA_ACCOUNT_ID ?? '',
  }
}
