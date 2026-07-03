import {
  getNombaApiBase,
  getNombaCredentials,
  getNombaEnvironment,
  hasNombaCredentials,
} from './config'
import type { NombaApiResponse, NombaAuthResult, NombaTokenResponse } from './types'
import { saveAccessToken } from './tokenStore'

/**
 * Obtain a Nomba access token using client credentials.
 * @see https://developer.nomba.com/docs/getting-started/authentication
 * @see https://developer.nomba.com/docs/getting-started/get-api-keys
 */
export async function issueAccessToken(): Promise<NombaAuthResult> {
  const environment = getNombaEnvironment()

  if (!hasNombaCredentials()) {
    return {
      ok: false,
      error:
        'Nomba sandbox credentials are not configured. Add VITE_NOMBA_CLIENT_ID, VITE_NOMBA_CLIENT_SECRET, and VITE_NOMBA_ACCOUNT_ID to your .env file.',
    }
  }

  const { clientId, clientSecret, accountId } = getNombaCredentials()
  const baseUrl = getNombaApiBase()

  try {
    const response = await fetch(`${baseUrl}/v1/auth/token/issue`, {
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

    const payload = (await response.json()) as NombaApiResponse<NombaTokenResponse>

    if (!response.ok || payload.code !== '00' || !payload.data?.access_token) {
      return {
        ok: false,
        error: payload.description || `Authentication failed (${response.status})`,
      }
    }

    saveAccessToken(payload.data, environment)
    return { ok: true, token: payload.data, environment }
  } catch {
    return {
      ok: false,
      error:
        'Could not reach the Nomba API. Check your network connection and ensure the dev proxy is running.',
    }
  }
}

/** Demo fallback for local UI testing when sandbox keys are not yet configured. */
export async function issueDemoAccessToken(): Promise<NombaAuthResult> {
  await new Promise((resolve) => setTimeout(resolve, 600))

  const demoToken: NombaTokenResponse = {
    access_token: 'demo_sandbox_token',
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  }

  saveAccessToken(demoToken, 'sandbox', true)
  return { ok: true, token: demoToken, environment: 'sandbox' }
}

export async function connectToNomba(options?: { allowDemo?: boolean }): Promise<NombaAuthResult> {
  if (hasNombaCredentials()) {
    return issueAccessToken()
  }

  if (options?.allowDemo) {
    return issueDemoAccessToken()
  }

  return issueAccessToken()
}
