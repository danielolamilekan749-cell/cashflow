import { supabase } from '../supabase/client'
import { getNombaBase, hasNombaCredentials, getNombaCredentials } from './config'
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredSession,
  saveAccessToken,
} from './tokenStore'
import type {
  NombaApiResponse,
  NombaAuthResult,
  NombaCredentials,
  NombaTokenResponse,
} from './types'

// ─── Issue token using real credentials ──────────────────────────────────────

export async function issueAccessToken(
  credentials: NombaCredentials,
): Promise<NombaAuthResult> {
  const { clientId, clientSecret, accountId } = credentials
  const base = getNombaBase(true) // always sandbox for now

  try {
    const response = await fetch(`${base}/auth/token/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', accountId },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })

    const payload = (await response.json()) as NombaApiResponse<NombaTokenResponse>

    if (!response.ok || payload.code !== '00' || !payload.data?.access_token) {
      return {
        ok: false,
        error: payload.description || `Authentication failed (HTTP ${response.status})`,
      }
    }

    saveAccessToken(payload.data, 'sandbox', false, { clientId, accountId })
    await persistSessionToSupabase({ clientId, accountId }, payload.data)
    return { ok: true, token: payload.data, environment: 'sandbox' }
  } catch (err) {
    return { ok: false, error: 'Could not reach Nomba API. Check credentials and network.' }
  }
}

// ─── Refresh token ────────────────────────────────────────────────────────────

export async function refreshAccessToken(): Promise<NombaAuthResult> {
  const session = getStoredSession()
  const refreshTkn = getRefreshToken()
  const accessTkn = getAccessToken()

  if (!session?.accountId || !refreshTkn || !accessTkn) {
    return { ok: false, error: 'No active session to refresh.' }
  }

  const base = getNombaBase(true)
  try {
    const response = await fetch(`${base}/auth/token/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId: session.accountId,
        Authorization: `Bearer ${accessTkn}`,
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshTkn,
      }),
    })

    const payload = (await response.json()) as NombaApiResponse<NombaTokenResponse>
    if (!response.ok || payload.code !== '00' || !payload.data?.access_token) {
      return { ok: false, error: payload.description || `Token refresh failed (HTTP ${response.status})` }
    }

    saveAccessToken(payload.data, session.environment, false, {
      clientId: session.clientId,
      accountId: session.accountId,
    })
    return { ok: true, token: payload.data, environment: session.environment }
  } catch {
    return { ok: false, error: 'Token refresh failed. Please reconnect.' }
  }
}

// ─── Revoke token ─────────────────────────────────────────────────────────────

export async function revokeAccessToken(): Promise<boolean> {
  const session = getStoredSession()
  const accessTkn = getAccessToken()

  if (!session?.accountId || !accessTkn) { clearSession(); return true }

  const base = getNombaBase(true)
  try {
    await fetch(`${base}/auth/token/revoke`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accountId: session.accountId,
        Authorization: `Bearer ${accessTkn}`,
      },
      body: JSON.stringify({
        clientId: session.clientId ?? '',
        access_token: accessTkn,
      }),
    })
  } catch { /* best-effort */ }

  clearSession()
  await removeSessionFromSupabase()
  return true
}

// ─── Demo fallback ────────────────────────────────────────────────────────────

export async function issueDemoAccessToken(): Promise<NombaAuthResult> {
  await new Promise((r) => setTimeout(r, 400))
  const demoToken: NombaTokenResponse = {
    access_token: 'demo_token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }
  saveAccessToken(demoToken, 'sandbox', true)
  return { ok: true, token: demoToken, environment: 'sandbox' }
}

// ─── connectSandbox — real auth if .env has credentials, else no-auth mode ───

export async function connectSandbox(): Promise<NombaAuthResult> {
  const base = getNombaBase(true)
  console.log('[connectSandbox] Sandbox base URL:', base)

  // If real credentials exist in .env — do a proper OAuth2 token issue
  if (hasNombaCredentials()) {
    console.log('[connectSandbox] Real credentials found — authenticating...')
    const creds = getNombaCredentials()
    const result = await issueAccessToken(creds)
    if (result.ok) {
      console.log('[connectSandbox] ✅ Authenticated with real credentials')
    } else {
      console.error('[connectSandbox] Auth failed:', result.error)
    }
    return result
  }

  // No credentials — use unauthenticated sandbox endpoints
  console.log('[connectSandbox] No credentials — using unauthenticated sandbox mode')

  try {
    const accountRef = `cashflow_${Date.now()}`
    const res = await fetch(`${base}/accounts/virtual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountRef, accountName: 'CashFlow AI Merchant' }),
    })

    const json = await res.json() as NombaApiResponse<{
      accountHolderId?: string
      bankAccountNumber?: string
      bankName?: string
    }>

    console.log('[connectSandbox] Virtual account response:', json)

    const accountId = json.data?.accountHolderId ?? accountRef
    const syntheticToken: NombaTokenResponse = {
      access_token: 'sandbox_no_auth',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }
    saveAccessToken(syntheticToken, 'sandbox', false, { clientId: 'sandbox', accountId })

    await supabase.from('nomba_sessions').upsert({
      account_id: accountId,
      client_id: 'sandbox',
      connected_at: new Date().toISOString(),
      expires_at: syntheticToken.expiresAt,
      environment: 'sandbox',
    }, { onConflict: 'account_id' }).catch(() => {})

    console.log('[connectSandbox] ✅ Unauthenticated sandbox session created, accountId:', accountId)
    return { ok: true, token: syntheticToken, environment: 'sandbox' }
  } catch (err) {
    console.error('[connectSandbox] Failed:', err)
    return issueDemoAccessToken()
  }
}

// ─── Supabase persistence ─────────────────────────────────────────────────────

async function persistSessionToSupabase(
  credentials: Pick<NombaCredentials, 'clientId' | 'accountId'>,
  token: NombaTokenResponse,
): Promise<void> {
  try {
    const expiresAt = token.expiresAt
      ?? (token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null)
    await supabase.from('nomba_sessions').upsert({
      account_id: credentials.accountId,
      client_id: credentials.clientId,
      connected_at: new Date().toISOString(),
      expires_at: expiresAt,
      environment: 'sandbox',
    }, { onConflict: 'account_id' })
  } catch { /* non-fatal */ }
}

async function removeSessionFromSupabase(): Promise<void> {
  const session = getStoredSession()
  if (!session?.accountId) return
  try {
    await supabase.from('nomba_sessions').delete().eq('account_id', session.accountId)
  } catch { /* non-fatal */ }
}
