/**
 * Nomba API — all data-fetching endpoints
 * Each function reads the stored token and makes authenticated requests.
 * All calls go through the Vite proxy (/api/nomba → https://api.nomba.com) in dev.
 */

import { getNombaApiBase, getNombaSandboxBase } from './config'
import { getAccessToken, getStoredSession } from './tokenStore'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** For sandbox sessions (no real credentials), skip auth headers entirely */
function isSandboxOnly(): boolean {
  const session = getStoredSession()
  return session?.clientId === 'sandbox' || session?.demoMode === true
}

function getBaseUrl(): string {
  return isSandboxOnly() ? getNombaSandboxBase() : getNombaApiBase()
}

function authHeaders(): Record<string, string> {
  if (isSandboxOnly()) {
    // Sandbox accepts calls with empty/no auth headers
    return { 'Content-Type': 'application/json' }
  }
  const token = getAccessToken()
  const session = getStoredSession()
  return {
    'Content-Type': 'application/json',
    Authorization: token ?? '',
    accountId: session?.accountId ?? '',
  }
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'GET',
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error(`Nomba API error ${res.status}: ${path}`)
  const json = await res.json()
  return json.data as T
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Nomba API error ${res.status}: ${path}`)
  const json = await res.json()
  return json.data as T
}

// ─── Types returned by the API ───────────────────────────────────────────────

export type NombaAccountDetails = {
  accountId: string
  accountName: string
  accountHolderId: string
  email?: string
  phoneNumber?: string
  status: string
  currency: string
  banks?: { bankAccountNumber: string; bankName: string; bankAccountName: string }[]
}

export type NombaBalance = {
  amount: string
  currency: string
  timeCreated: string
}

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

export type NombaTransactionList = {
  results: NombaTransaction[]
  cursor?: string
}

export type NombaBankTransaction = {
  amount: number
  currency: string
  status: string
  transactionType: 'CREDIT' | 'DEBIT'
  timeUpdated: string
  walletBalance: number
  meta?: {
    type?: string
    transactionId?: string
    merchantTxRef?: string
    fee?: number
  }
}

export type NombaBankTransactionList = {
  results: NombaBankTransaction[]
  cursor?: string
}

export type NombaSubAccount = {
  accountId: string
  accountName: string
  accountRef: string
  phoneNumber?: string
  email?: string
  status: string
  currency: string
  banks?: { bankAccountNumber: string; bankName: string }[]
  createdAt: string
}

export type NombaSubAccountList = {
  results: NombaSubAccount[]
  cursor?: string
}

export type NombaTerminal = {
  terminalId: string
  serialNumber: string
  accountId: string
  merchantName: string
  terminalLabel: string
  createdAt: string
}

export type NombaTerminalList = {
  results: NombaTerminal[]
  cursor?: string
}

export type NombaBank = { code: string; name: string }

// ─── Accounts ────────────────────────────────────────────────────────────────

/** Fetch parent account details (name, phone, email, bank info) */
export async function fetchParentAccount(): Promise<NombaAccountDetails> {
  return get<NombaAccountDetails>('/v1/accounts/parent')
}

/** Fetch parent account NGN balance */
export async function fetchAccountBalance(): Promise<NombaBalance> {
  return get<NombaBalance>('/v1/accounts/balance')
}

/** List all sub-accounts */
export async function fetchSubAccounts(limit = 20): Promise<NombaSubAccountList> {
  return get<NombaSubAccountList>(`/v1/accounts?limit=${limit}`)
}

/** Fetch a sub-account's balance */
export async function fetchSubAccountBalance(subAccountId: string): Promise<NombaBalance> {
  return get<NombaBalance>(`/v1/accounts/${subAccountId}/balance`)
}

// ─── Transactions ─────────────────────────────────────────────────────────────

/** All transactions on the parent account, with optional date range */
export async function fetchTransactions(params?: {
  limit?: number
  cursor?: string
  dateFrom?: string
  dateTo?: string
}): Promise<NombaTransactionList> {
  const q = new URLSearchParams()
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.cursor) q.set('cursor', params.cursor)
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo) q.set('dateTo', params.dateTo)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return get<NombaTransactionList>(`/v1/transactions/accounts${qs}`)
}

/** Filter transactions by type, status, or reference */
export async function filterTransactions(filters: {
  status?: string
  type?: string
  source?: string
  terminalId?: string
  merchantTxRef?: string
  dateFrom?: string
  dateTo?: string
  limit?: number
}): Promise<NombaTransactionList> {
  const q = new URLSearchParams()
  if (filters.limit) q.set('limit', String(filters.limit))
  if (filters.dateFrom) q.set('dateFrom', filters.dateFrom)
  if (filters.dateTo) q.set('dateTo', filters.dateTo)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return post<NombaTransactionList>(`/v1/transactions/accounts${qs}`, {
    status: filters.status,
    type: filters.type,
    source: filters.source,
    terminalId: filters.terminalId,
    merchantTxRef: filters.merchantTxRef,
  })
}

/** Fetch credit/debit bank transactions (with walletBalance) */
export async function fetchBankTransactions(params?: {
  limit?: number
  dateFrom?: string
  dateTo?: string
}): Promise<NombaBankTransactionList> {
  const q = new URLSearchParams()
  if (params?.limit) q.set('limit', String(params.limit))
  if (params?.dateFrom) q.set('dateFrom', params.dateFrom)
  if (params?.dateTo) q.set('dateTo', params.dateTo)
  const qs = q.toString() ? `?${q.toString()}` : ''
  return get<NombaBankTransactionList>(`/v1/transactions/bank${qs}`)
}

/** Fetch a single transaction by reference */
export async function fetchSingleTransaction(ref: string): Promise<NombaTransaction> {
  return get<NombaTransaction>(`/v1/transactions/accounts/single?transactionRef=${encodeURIComponent(ref)}`)
}

/** Requery a transaction status by session ID */
export async function requeueTransaction(sessionId: string): Promise<NombaTransaction> {
  return get<NombaTransaction>(`/v1/transactions/requery/${sessionId}`)
}

// ─── Terminals ────────────────────────────────────────────────────────────────

/** List POS terminals on the parent account */
export async function fetchTerminals(limit = 20): Promise<NombaTerminalList> {
  return get<NombaTerminalList>(`/v1/accounts/terminals?limit=${limit}`)
}

// ─── Transfers ────────────────────────────────────────────────────────────────

/** List all Nigerian banks with their codes */
export async function fetchBanks(): Promise<{ results: NombaBank[] }> {
  return get<{ results: NombaBank[] }>('/v1/transfers/banks')
}

/** Look up a bank account name */
export async function lookupBankAccount(accountNumber: string, bankCode: string) {
  return post<{ accountNumber: string; accountName: string }>('/v1/transfers/bank/lookup', {
    accountNumber,
    bankCode,
  })
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function dateRange(period: '7d' | '30d' | '90d' | '12m'): { dateFrom: string; dateTo: string } {
  const now = new Date()
  const dateTo = now.toISOString()
  const dateFrom = new Date(now)

  if (period === '7d') dateFrom.setDate(now.getDate() - 7)
  else if (period === '30d') dateFrom.setDate(now.getDate() - 30)
  else if (period === '90d') dateFrom.setDate(now.getDate() - 90)
  else dateFrom.setFullYear(now.getFullYear() - 1)

  return { dateFrom: dateFrom.toISOString(), dateTo }
}
