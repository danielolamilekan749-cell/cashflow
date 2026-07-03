import type { NombaEnvironment, NombaTokenResponse, StoredNombaSession } from './types'

const SESSION_KEY = 'cashflow-nomba-session'
const TOKEN_KEY = 'cashflow-nomba-token'
const REFRESH_KEY = 'cashflow-nomba-refresh'

// ─── Session ────────────────────────────────────────────────────────────────

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
  sessionStorage.removeItem(REFRESH_KEY)
}

export function isSessionConnected(): boolean {
  return Boolean(getStoredSession())
}

// ─── Tokens ─────────────────────────────────────────────────────────────────

export function saveAccessToken(
  token: NombaTokenResponse,
  environment: NombaEnvironment,
  demoMode = false,
  extra?: { clientId?: string; accountId?: string },
): void {
  const expiresAt = token.expiresAt
    ?? (token.expires_in
      ? new Date(Date.now() + token.expires_in * 1000).toISOString()
      : undefined)

  sessionStorage.setItem(TOKEN_KEY, token.access_token)
  if (token.refresh_token) {
    sessionStorage.setItem(REFRESH_KEY, token.refresh_token)
  }

  saveSession({
    connectedAt: new Date().toISOString(),
    environment,
    expiresAt,
    demoMode,
    clientId: extra?.clientId,
    accountId: extra?.accountId,
  })
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY)
}

export function isTokenExpired(): boolean {
  const session = getStoredSession()
  if (!session?.expiresAt) return false
  // treat as expired 60 seconds early
  return new Date(session.expiresAt).getTime() - 60_000 < Date.now()
}
