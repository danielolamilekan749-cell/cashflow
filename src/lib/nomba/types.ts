export type NombaEnvironment = 'sandbox' | 'production'

export type NombaTokenResponse = {
  access_token: string
  refresh_token?: string
  expiresAt?: string
}

export type NombaApiResponse<T> = {
  code: string
  description: string
  data: T
}

export type NombaAuthResult =
  | { ok: true; token: NombaTokenResponse; environment: NombaEnvironment }
  | { ok: false; error: string }

export type StoredNombaSession = {
  connectedAt: string
  environment: NombaEnvironment
  expiresAt?: string
  demoMode?: boolean
}
