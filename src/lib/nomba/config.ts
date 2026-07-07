import type { NombaEnvironment } from './types'

// ─── Base URLs ────────────────────────────────────────────────────────────────
// NOTE: The sandbox base is sandbox.api.nomba.com (NOT sandbox.nomba.com)
export const NOMBA_PRODUCTION_URL = 'https://api.nomba.com'
export const NOMBA_SANDBOX_URL    = 'https://sandbox.api.nomba.com'

/** Vite dev-proxy paths — avoid CORS in the browser during local dev */
export const NOMBA_PROXY         = '/api/nomba'
export const NOMBA_SANDBOX_PROXY = '/api/nomba-sandbox'

export function getNombaEnvironment(): NombaEnvironment {
  return import.meta.env.VITE_NOMBA_ENV === 'production' ? 'production' : 'sandbox'
}

/** Returns the correct base URL for the current environment + mode */
export function getNombaBase(sandbox = true): string {
  if (import.meta.env.DEV) {
    return sandbox ? NOMBA_SANDBOX_PROXY : NOMBA_PROXY
  }
  return sandbox ? NOMBA_SANDBOX_URL : NOMBA_PRODUCTION_URL
}

/** Kept for backwards compat */
export function getNombaApiBase(): string  { return getNombaBase(false) }
export function getNombaSandboxBase(): string { return getNombaBase(true) }

/** True when real .env credentials are present */
export function hasNombaCredentials(): boolean {
  return Boolean(
    import.meta.env.VITE_NOMBA_CLIENT_ID &&
    import.meta.env.VITE_NOMBA_CLIENT_ID !== 'your_sandbox_client_id' &&
    import.meta.env.VITE_NOMBA_CLIENT_SECRET &&
    import.meta.env.VITE_NOMBA_CLIENT_SECRET !== 'your_sandbox_client_secret' &&
    import.meta.env.VITE_NOMBA_ACCOUNT_ID &&
    import.meta.env.VITE_NOMBA_ACCOUNT_ID !== 'your_sandbox_account_id',
  )
}

export function getNombaCredentials() {
  return {
    clientId:     import.meta.env.VITE_NOMBA_CLIENT_ID     as string,
    clientSecret: import.meta.env.VITE_NOMBA_CLIENT_SECRET as string,
    accountId:    import.meta.env.VITE_NOMBA_ACCOUNT_ID    as string,
  }
}
