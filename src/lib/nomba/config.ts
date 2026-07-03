import type { NombaEnvironment } from './types'

export const NOMBA_PRODUCTION_URL = 'https://api.nomba.com'
export const NOMBA_SANDBOX_URL = 'https://sandbox.nomba.com'

/** Vite dev-proxy path — avoids CORS issues when calling Nomba from the browser. */
export const NOMBA_API_PROXY = '/api/nomba'

export function getNombaEnvironment(): NombaEnvironment {
  return import.meta.env.VITE_NOMBA_ENV === 'production' ? 'production' : 'sandbox'
}

/**
 * In dev: routes through the Vite proxy (/api/nomba → https://api.nomba.com).
 * In production: use a backend proxy — never ship client secrets in the bundle.
 */
export function getNombaApiBase(): string {
  return import.meta.env.DEV ? NOMBA_API_PROXY : NOMBA_PRODUCTION_URL
}
