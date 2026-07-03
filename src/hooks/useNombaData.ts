/**
 * useNombaData — central hook that fetches all live Nomba data.
 * Pages import what they need from this hook.
 * Falls back to mock data when not connected or in demo mode.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  dateRange,
  fetchAccountBalance,
  fetchBankTransactions,
  fetchParentAccount,
  fetchSubAccounts,
  fetchTerminals,
  fetchTransactions,
  type NombaAccountDetails,
  type NombaBankTransaction,
  type NombaBalance,
  type NombaSubAccountList,
  type NombaTerminalList,
  type NombaTransaction,
} from '../lib/nomba/api'
import { supabase } from '../lib/supabase/client'
import { useNombaConnection } from '../context/NombaConnectionContext'

export type ChartPoint = {
  name: string
  revenue: number
  sales: number
  customers: number
  profit: number
}

export type LiveKPI = {
  id: string
  label: string
  value: string
  raw: number
  change: number
  changeLabel: string
}

export type NombaDataState = {
  loading: boolean
  error: string | null

  // Account
  account: NombaAccountDetails | null
  balance: NombaBalance | null

  // Transactions
  transactions: NombaTransaction[]
  bankTransactions: NombaBankTransaction[]
  chartData: ChartPoint[]
  monthlyChartData: ChartPoint[]

  // KPIs derived from transactions
  kpis: LiveKPI[]

  // Sub-accounts & terminals
  subAccounts: NombaSubAccountList | null
  terminals: NombaTerminalList | null

  // Re-fetch trigger
  refresh: () => void
}

function formatNGN(amount: number): string {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000) return `₦${(amount / 1_000).toFixed(0)}K`
  return `₦${amount.toLocaleString('en-NG')}`
}

/** Build 7-day chart data from a transaction list */
function buildChartData(txns: NombaTransaction[], days = 7): ChartPoint[] {
  const points: ChartPoint[] = []
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dayLabel = days <= 7 ? dayNames[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`

    const dayTxns = txns.filter((t) => {
      const td = new Date(t.timeCreated)
      return (
        td.getFullYear() === d.getFullYear() &&
        td.getMonth() === d.getMonth() &&
        td.getDate() === d.getDate() &&
        t.status === 'SUCCESS'
      )
    })

    const revenue = dayTxns.reduce((s, t) => s + (t.amount ?? 0), 0)
    const sales = dayTxns.filter((t) => ['purchase', 'online_checkout'].includes(t.type)).length
    const customers = new Set(dayTxns.map((t) => t.id).slice(0, 20)).size

    points.push({
      name: dayLabel,
      revenue,
      sales,
      customers,
      profit: revenue * 0.3,
    })
  }
  return points
}

/** Build 12-month chart data from bank transactions */
function buildMonthlyData(txns: NombaBankTransaction[]): ChartPoint[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const points: ChartPoint[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = months[d.getMonth()]

    const monthTxns = txns.filter((t) => {
      const td = new Date(t.timeUpdated)
      return (
        td.getFullYear() === d.getFullYear() &&
        td.getMonth() === d.getMonth() &&
        t.transactionType === 'CREDIT' &&
        t.status === 'SUCCESS'
      )
    })

    const revenue = monthTxns.reduce((s, t) => s + (t.amount ?? 0), 0)
    points.push({
      name: label,
      revenue,
      sales: monthTxns.length,
      customers: Math.floor(monthTxns.length * 0.7),
      profit: revenue * 0.3,
    })
  }
  return points
}

/** Derive KPI cards from live data */
function buildKPIs(
  txns: NombaTransaction[],
  balance: NombaBalance | null,
): LiveKPI[] {
  const successTxns = txns.filter((t) => t.status === 'SUCCESS')
  const now = new Date()

  const todayTxns = successTxns.filter((t) => {
    const d = new Date(t.timeCreated)
    return d.toDateString() === now.toDateString()
  })
  const todayRevenue = todayTxns.reduce((s, t) => s + t.amount, 0)

  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14)
  const weekTxns = successTxns.filter((t) => new Date(t.timeCreated) >= weekAgo)
  const lastWeekTxns = successTxns.filter((t) => {
    const d = new Date(t.timeCreated)
    return d >= lastWeekStart && d < weekAgo
  })
  const weekRevenue = weekTxns.reduce((s, t) => s + t.amount, 0)
  const lastWeekRevenue = lastWeekTxns.reduce((s, t) => s + t.amount, 0)
  const weekChange = lastWeekRevenue > 0 ? ((weekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthTxns = successTxns.filter((t) => new Date(t.timeCreated) >= monthStart)
  const monthRevenue = monthTxns.reduce((s, t) => s + t.amount, 0)

  const totalTxns = successTxns.length
  const avgOrder = totalTxns > 0 ? successTxns.reduce((s, t) => s + t.amount, 0) / totalTxns : 0

  const liveBalance = balance ? parseFloat(balance.amount) : 0

  return [
    {
      id: 'balance',
      label: 'Account Balance',
      value: formatNGN(liveBalance),
      raw: liveBalance,
      change: 0,
      changeLabel: 'current balance',
    },
    {
      id: 'today-revenue',
      label: "Today's Revenue",
      value: formatNGN(todayRevenue),
      raw: todayRevenue,
      change: 0,
      changeLabel: 'vs yesterday',
    },
    {
      id: 'weekly-revenue',
      label: 'Weekly Revenue',
      value: formatNGN(weekRevenue),
      raw: weekRevenue,
      change: parseFloat(weekChange.toFixed(1)),
      changeLabel: 'vs last week',
    },
    {
      id: 'monthly-revenue',
      label: 'Monthly Revenue',
      value: formatNGN(monthRevenue),
      raw: monthRevenue,
      change: 0,
      changeLabel: 'this month',
    },
    {
      id: 'total-txns',
      label: 'Total Transactions',
      value: String(totalTxns),
      raw: totalTxns,
      change: 0,
      changeLabel: 'all time',
    },
    {
      id: 'avg-order',
      label: 'Avg Transaction',
      value: formatNGN(avgOrder),
      raw: avgOrder,
      change: 0,
      changeLabel: 'per transaction',
    },
  ]
}

export function useNombaData() {
  const { isConnected, session } = useNombaConnection()
  const [state, setState] = useState<Omit<NombaDataState, 'refresh'>>({
    loading: false,
    error: null,
    account: null,
    balance: null,
    transactions: [],
    bankTransactions: [],
    chartData: [],
    monthlyChartData: [],
    kpis: [],
    subAccounts: null,
    terminals: null,
  })
  const fetchedRef = useRef(false)

  const load = useCallback(async () => {
    if (!isConnected) return
    if (session?.demoMode) return // keep mock data in demo mode

    setState((s) => ({ ...s, loading: true, error: null }))
    fetchedRef.current = true

    try {
      // Fire all fetches in parallel
      const [account, balance, txnData, bankTxnData, subAccts, terminals] = await Promise.allSettled([
        fetchParentAccount(),
        fetchAccountBalance(),
        fetchTransactions({ limit: 100, ...dateRange('7d') }),
        fetchBankTransactions({ limit: 200, ...dateRange('12m') }),
        fetchSubAccounts(20),
        fetchTerminals(20),
      ])

      const resolvedAccount = account.status === 'fulfilled' ? account.value : null
      const resolvedBalance = balance.status === 'fulfilled' ? balance.value : null
      const txns = txnData.status === 'fulfilled' ? txnData.value.results : []
      const bankTxns = bankTxnData.status === 'fulfilled' ? bankTxnData.value.results : []
      const resolvedSubs = subAccts.status === 'fulfilled' ? subAccts.value : null
      const resolvedTerminals = terminals.status === 'fulfilled' ? terminals.value : null

      const chart = buildChartData(txns, 7)
      const monthly = buildMonthlyData(bankTxns)
      const kpis = buildKPIs(txns, resolvedBalance)

      // Persist merchant info to Supabase
      if (resolvedAccount && session?.accountId) {
        supabase.from('merchant_profiles').upsert({
          account_id: session.accountId,
          account_name: resolvedAccount.accountName,
          email: resolvedAccount.email,
          phone_number: resolvedAccount.phoneNumber,
          status: resolvedAccount.status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'account_id' }).catch(() => {})
      }

      setState({
        loading: false,
        error: null,
        account: resolvedAccount,
        balance: resolvedBalance,
        transactions: txns,
        bankTransactions: bankTxns,
        chartData: chart,
        monthlyChartData: monthly,
        kpis,
        subAccounts: resolvedSubs,
        terminals: resolvedTerminals,
      })
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to load data',
      }))
    }
  }, [isConnected, session])

  useEffect(() => {
    if (isConnected && !fetchedRef.current) {
      load()
    }
    if (!isConnected) {
      fetchedRef.current = false
    }
  }, [isConnected, load])

  return { ...state, refresh: load }
}
