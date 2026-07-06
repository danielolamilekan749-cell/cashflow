import type { NombaEnvironment } from './types'

export const NOMBA_PRODUCTION_URL = 'https://api.nomba.com'
export const NOMBA_SANDBOX_URL = 'https://sandbox.nomba.com'

/** Vite dev-proxy paths */
export const NOMBA_API_PROXY = '/api/nomba'
export const NOMBA_SANDBOX_PROXY = '/api/nomba-sandbox'

export function getNombaEnvironment(): NombaEnvironment {
  return import.meta.env.VITE_NOMBA_ENV === 'production' ? 'production' : 'sandbox'
}

/** Base URL for authenticated (real credentials) calls */
export function getNombaApiBase(): string {
  return import.meta.env.DEV ? NOMBA_API_PROXY : NOMBA_PRODUCTION_URL
}

/** Base URL for sandbox (no credentials needed) calls */
export function getNombaSandboxBase(): string {
  return import.meta.env.DEV ? NOMBA_SANDBOX_PROXY : NOMBA_SANDBOX_URL
}
