import type { NombaEnvironment, NombaTokenResponse, StoredNombaSession } from './types'

const SESSION_KEY = 'cashflow-nomba-session'
const TOKEN_KEY = 'cashflow-nomba-token'

export function getStoredSession(): StoredNombaSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as StoredNombaSession) : null
  } catch {
    return null
  }
}

export function saveSession(session: StoredNombaSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function isSessionConnected(): boolean {
  return Boolean(getStoredSession())
}

export function saveAccessToken(token: NombaTokenResponse, environment: NombaEnvironment, demoMode = false): void {
  sessionStorage.setItem(TOKEN_KEY, token.access_token)
  saveSession({
    connectedAt: new Date().toISOString(),
    environment,
    expiresAt: token.expiresAt,
    demoMode,
  })
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}
