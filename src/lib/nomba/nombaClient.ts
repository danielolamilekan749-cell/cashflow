/**
 * nombaClient.ts
 * ─────────────────────────────────────────────────────────────
 * Authenticated HTTP wrapper for the Nomba sandbox API.
 * Every request calls getValidToken() first, so tokens are
 * refreshed automatically and errors are surfaced clearly.
 */

import { getValidToken } from './nombaAuth'
import { getNombaBase } from './config'

// ─── Core request helper ──────────────────────────────────────────────────────

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const authResult = await getValidToken()
  if (!authResult.ok) {
    throw new Error(`[nombaClient] Auth failed: ${authResult.error.message}`)
  }

  const { accessToken, accountId } = authResult.token
  const base = getNombaBase(true)

  const res = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      accountId,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  let json: Record<string, unknown> = {}
  try { json = await res.json() } catch { /* empty body */ }

  if (!res.ok || (json.code && json.code !== '00')) {
    const msg = (json.description as string) || `HTTP ${res.status} on ${path}`
    console.error(`[nombaClient] Request failed: ${msg}`, json)
    throw new Error(msg)
  }

  return (json.data ?? json) as T
}

const get  = <T>(path: string)               => request<T>('GET',  path)
const post = <T>(path: string, body: unknown) => request<T>('POST', path, body)

// ─── Transactions ─────────────────────────────────────────────────────────────

export type NombaTransaction = {
  id: string
  status: string
  amount: number
  type: string
  source: string
  timeCreated: string
  gatewayMessage?: string
  rrn?: string
  terminalId?: string
  merchantTxRef?: string
}

export type TransactionListResult = {
  results: NombaTransaction[]
  cursor?: string
}

export async function getTransactions(params?: {
  limit?:    number
  cursor?:   string
  dateFrom?: string
  dateTo?:   string
}): Promise<TransactionListResult> {
  const q = new URLSearchParams()
  if (params?.limit)    q.set('limit',    String(params.limit))
  if (params?.cursor)   q.set('cursor',   params.cursor)
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo)   q.set('dateTo',   params.dateTo)
  const qs = q.toString() ? `?${q}` : ''
  return get<TransactionListResult>(`/transactions/accounts${qs}`)
}

export async function getBankTransactions(params?: {
  limit?:    number
  dateFrom?: string
  dateTo?:   string
}): Promise<{ results: BankTransaction[]; cursor?: string }> {
  const q = new URLSearchParams()
  if (params?.limit)    q.set('limit',    String(params.limit))
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo)   q.set('dateTo',   params.dateTo)
  const qs = q.toString() ? `?${q}` : ''
  return get(`/transactions/bank${qs}`)
}

export type BankTransaction = {
  amount: number
  currency: string
  status: string
  transactionType: 'CREDIT' | 'DEBIT'
  timeUpdated: string
  walletBalance: number
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export type AccountDetails = {
  accountId: string
  accountName: string
  email?: string
  phoneNumber?: string
  status: string
  currency: string
  banks?: { bankAccountNumber: string; bankName: string; bankAccountName: string }[]
}

export type AccountBalance = {
  amount: string
  currency: string
  timeCreated: string
}

export async function getParentAccount(): Promise<AccountDetails> {
  return get<AccountDetails>('/accounts/parent')
}

export async function getAccountBalance(): Promise<AccountBalance> {
  return get<AccountBalance>('/accounts/balance')
}

// ─── Virtual accounts ────────────────────────────────────────────────────────

export type VirtualAccount = {
  accountRef: string
  accountName: string
  bankAccountNumber: string
  bankName: string
  bankAccountName: string
  currency: string
  accountHolderId?: string
}

export async function createVirtualAccount(params: {
  accountRef:  string
  accountName: string
}): Promise<VirtualAccount> {
  return post<VirtualAccount>('/accounts/virtual', {
    accountRef:  params.accountRef,
    accountName: params.accountName,
  })
}

// ─── Checkout orders ─────────────────────────────────────────────────────────

export type CheckoutOrder = {
  checkoutLink: string
  orderReference: string
}

export async function createCheckoutOrder(params: {
  orderReference: string
  amount:         number
  currency?:      string
  customerEmail?: string
  callbackUrl?:   string
}): Promise<CheckoutOrder> {
  return post<CheckoutOrder>('/checkout/order', {
    order: {
      orderReference: params.orderReference,
      amount:         String(params.amount),
      currency:       params.currency ?? 'NGN',
      customerEmail:  params.customerEmail ?? 'test@cashflowai.ng',
      callbackUrl:    params.callbackUrl ?? 'https://cashflowai.ng/callback',
    },
  })
}
