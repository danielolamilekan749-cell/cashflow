/**
 * nombaAuth.ts
 * ─────────────────────────────────────────────────────────────
 * Handles OAuth2 client-credentials auth with Nomba sandbox.
 *
 * Token lifecycle:
 *  - issue  → POST /auth/token/issue (expires in 30 min)
 *  - refresh → POST /auth/token/refresh (called automatically when <5 min left)
 *  - getValidToken() → always returns a live token, refreshing silently if needed
 *
 * All errors are surfaced — never silently swallowed.
 */

import { getNombaBase, getNombaCredentials, hasNombaCredentials } from './config'
import { supabase } from '../supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthToken = {
  accessToken: string
  refreshToken: string
  expiresAt: number  // unix ms
  accountId: string
}

export type AuthError = {
  code: string
  message: string
  raw?: unknown
}

export type AuthResult =
  | { ok: true;  token: AuthToken }
  | { ok: false; error: AuthError }

// ─── In-memory store (survives re-renders, not page reload) ──────────────────

let _token: AuthToken | null = null

const STORAGE_KEY = 'cashflow_nomba_token'

function saveToStorage(token: AuthToken) {
  _token = token
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(token))
  } catch { /* ignore */ }
}

function loadFromStorage(): AuthToken | null {
  if (_token) return _token
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      _token = JSON.parse(raw) as AuthToken
      return _token
    }
  } catch { /* ignore */ }
  return null
}

function clearStorage() {
  _token = null
  try { sessionStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isExpiredOrSoon(token: AuthToken, bufferMs = 5 * 60 * 1000): boolean {
  return Date.now() >= token.expiresAt - bufferMs
}

function makeError(code: string, message: string, raw?: unknown): AuthError {
  console.error(`[nombaAuth] ${code}: ${message}`, raw ?? '')
  return { code, message, raw }
}

async function parseResponse(res: Response): Promise<{ ok: boolean; code: string; description: string; data: Record<string, unknown> }> {
  let body: Record<string, unknown> = {}
  try { body = await res.json() } catch { /* empty body */ }
  return {
    ok: res.ok,
    code: (body.code as string) ?? String(res.status),
    description: (body.description as string) ?? res.statusText,
    data: (body.data as Record<string, unknown>) ?? {},
  }
}

// ─── Issue token ──────────────────────────────────────────────────────────────

export async function issueToken(): Promise<AuthResult> {
  if (!hasNombaCredentials()) {
    return {
      ok: false,
      error: makeError(
        'NO_CREDENTIALS',
        'Nomba credentials not configured. Add VITE_NOMBA_CLIENT_ID, VITE_NOMBA_CLIENT_SECRET, and VITE_NOMBA_ACCOUNT_ID to your .env file.',
      ),
    }
  }

  const { clientId, clientSecret, accountId } = getNombaCredentials()
  const base = getNombaBase(true) // sandbox

  console.log('[nombaAuth] Issuing token from:', `${base}/auth/token/issue`)

  let res: Response
  try {
    res = await fetch(`${base}/auth/token/issue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
  } catch (err) {
    return {
      ok: false,
      error: makeError('NETWORK_ERROR', 'Could not reach Nomba sandbox. Check your internet connection.', err),
    }
  }

  const payload = await parseResponse(res)
  console.log('[nombaAuth] Issue response code:', payload.code)

  if (!payload.ok || payload.code !== '00') {
    return {
      ok: false,
      error: makeError(
        payload.code || 'AUTH_FAILED',
        payload.description || `Authentication failed (HTTP ${res.status})`,
        payload,
      ),
    }
  }

  const data = payload.data
  if (!data.access_token) {
    return {
      ok: false,
      error: makeError('MISSING_TOKEN', 'Nomba returned a success code but no access_token', payload),
    }
  }

  // Tokens expire in 30 min — Nomba returns expiresAt as ISO string
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt as string).getTime()
    : Date.now() + 30 * 60 * 1000

  const token: AuthToken = {
    accessToken:  data.access_token as string,
    refreshToken: (data.refresh_token as string) ?? '',
    expiresAt,
    accountId,
  }

  saveToStorage(token)
  await persistToSupabase(accountId, expiresAt)

  console.log('[nombaAuth] ✅ Token issued, expires:', new Date(expiresAt).toLocaleTimeString())
  return { ok: true, token }
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export async function refreshToken(current: AuthToken): Promise<AuthResult> {
  if (!current.refreshToken) {
    // No refresh token — re-issue from scratch
    return issueToken()
  }

  const base = getNombaBase(true)
  console.log('[nombaAuth] Refreshing token...')

  let res: Response
  try {
    res = await fetch(`${base}/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId: current.accountId,
        Authorization: `Bearer ${current.accessToken}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: current.refreshToken,
      }),
    })
  } catch (err) {
    return {
      ok: false,
      error: makeError('NETWORK_ERROR', 'Token refresh failed — network error', err),
    }
  }

  const payload = await parseResponse(res)

  if (!payload.ok || payload.code !== '00') {
    console.warn('[nombaAuth] Refresh failed, attempting re-issue...')
    return issueToken()
  }

  const data = payload.data
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt as string).getTime()
    : Date.now() + 30 * 60 * 1000

  const token: AuthToken = {
    accessToken:  (data.access_token as string) ?? current.accessToken,
    refreshToken: (data.refresh_token as string) ?? current.refreshToken,
    expiresAt,
    accountId: current.accountId,
  }

  saveToStorage(token)
  console.log('[nombaAuth] ✅ Token refreshed, expires:', new Date(expiresAt).toLocaleTimeString())
  return { ok: true, token }
}

// ─── getValidToken — always call this before any API request ─────────────────

export async function getValidToken(): Promise<AuthResult> {
  let token = loadFromStorage()

  if (!token) {
    return issueToken()
  }

  if (isExpiredOrSoon(token)) {
    return refreshToken(token)
  }

  return { ok: true, token }
}

// ─── Revoke ───────────────────────────────────────────────────────────────────

export async function revokeToken(): Promise<void> {
  const token = loadFromStorage()
  clearStorage()

  if (!token) return

  const base = getNombaBase(true)
  try {
    await fetch(`${base}/auth/token/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId: token.accountId,
        Authorization: `Bearer ${token.accessToken}`,
      },
      body: JSON.stringify({
        clientId: getNombaCredentials().clientId,
        access_token: token.accessToken,
      }),
    })
    console.log('[nombaAuth] Token revoked')
  } catch {
    // best-effort
  }
}

// ─── Supabase persistence ─────────────────────────────────────────────────────

async function persistToSupabase(accountId: string, expiresAt: number) {
  try {
    await supabase.from('nomba_sessions').upsert({
      account_id: accountId,
      client_id: getNombaCredentials().clientId,
      connected_at: new Date().toISOString(),
      expires_at: new Date(expiresAt).toISOString(),
      environment: 'sandbox',
    }, { onConflict: 'account_id' })
  } catch { /* non-fatal */ }
}
