import { AnimatePresence, motion } from 'framer-motion'
import { Activity, CheckCircle2, Wallet, TrendingUp, ArrowDownUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import AnalyticsChart, { PeriodFilter } from '../components/charts/AnalyticsChart'
import AnalyticsChartSkeleton from '../components/charts/AnalyticsChartSkeleton'
import BusinessHealthCard from '../components/dashboard/BusinessHealthCard'
import NombaConnectOverlay from '../components/nomba/NombaConnectOverlay'
import BusinessHealthCardSkeleton from '../components/dashboard/BusinessHealthCardSkeleton'
import KPICard from '../components/ui/KPICard'
import KPICardSkeleton from '../components/ui/KPICardSkeleton'
import SectionHeader from '../components/ui/SectionHeader'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { useNombaData } from '../hooks/useNombaData'
import {
  kpis as mockKpis,
  monthlyChartData as mockMonthly,
  revenueChartData as mockRevenue,
} from '../data/mockData'
import type { ChartPeriod } from '../types'
import type { KPI } from '../types'
import { Banknote, CalendarDays, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const KPI_ICONS: Record<string, LucideIcon> = {
  balance: Wallet,
  'today-revenue': Banknote,
  'weekly-revenue': TrendingUp,
  'monthly-revenue': CalendarDays,
  'total-txns': ArrowDownUp,
  'avg-order': Activity,
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

function DashboardSlot({
  ready,
  loading,
  children,
}: {
  ready: boolean
  loading: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {ready ? (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      ) : (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {loading}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function Dashboard() {
  const { isSyncing, isConnected, session, completeSync } = useNombaConnection()
  const nomba = useNombaData()
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const [loadedBusinessHealth, setLoadedBusinessHealth] = useState(false)
  const [loadedKpiCount, setLoadedKpiCount] = useState(0)
  const [loadedRevenueChart, setLoadedRevenueChart] = useState(false)
  const [loadedSalesChart, setLoadedSalesChart] = useState(false)
  const [loadedCustomerChart, setLoadedCustomerChart] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  // Use live data if available, else fall back to mock
  const isDemo = session?.demoMode ?? true
  const displayKpis: KPI[] = isDemo || nomba.kpis.length === 0
    ? mockKpis
    : nomba.kpis.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
        change: k.change,
        changeLabel: k.changeLabel,
        icon: KPI_ICONS[k.id] ?? Banknote,
        sparkline: [40, 45, 38, 50, 48, 55, 60],
        accent: k.id === 'balance' ? 'success' : undefined,
      }))

  const chartData = period === '12m'
    ? (isDemo || nomba.monthlyChartData.length === 0 ? mockMonthly : nomba.monthlyChartData)
    : (isDemo || nomba.chartData.length === 0 ? mockRevenue : nomba.chartData)

  // Sync animation sequence
  useEffect(() => {
    if (!isSyncing) return

    setLoadedBusinessHealth(false)
    setLoadedKpiCount(0)
    setLoadedRevenueChart(false)
    setLoadedSalesChart(false)
    setLoadedCustomerChart(false)
    setShowSuccessAlert(false)

    if (!session) return

    const timeouts: number[] = []
    const schedule = (fn: () => void, delay: number) => {
      timeouts.push(window.setTimeout(fn, delay))
    }

    let delay = 220
    schedule(() => setLoadedBusinessHealth(true), delay)

    displayKpis.forEach((_, i) => {
      delay += 140
      schedule(() => setLoadedKpiCount(i + 1), delay)
    })

    delay += 180; schedule(() => setLoadedRevenueChart(true), delay)
    delay += 160; schedule(() => setLoadedSalesChart(true), delay)
    delay += 160; schedule(() => setLoadedCustomerChart(true), delay)
    delay += 220; schedule(() => { setShowSuccessAlert(true); completeSync() }, delay)

    return () => timeouts.forEach(window.clearTimeout)
  }, [isSyncing, session])

  useEffect(() => {
    if (!showSuccessAlert) return
    const t = window.setTimeout(() => setShowSuccessAlert(false), 2600)
    return () => window.clearTimeout(t)
  }, [showSuccessAlert])

  return (
    <NombaConnectOverlay>
      <div className="relative">
        <AnimatePresence>
          {showSuccessAlert && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="fixed inset-x-4 top-20 z-[65] mx-auto max-w-sm rounded-2xl border border-status-success/20 bg-white/95 p-4 shadow-xl backdrop-blur"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-success-soft">
                  <CheckCircle2 className="h-5 w-5 text-status-success" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-black">
                    {isDemo ? 'Demo mode active' : 'Sync completed successfully'}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {isDemo
                      ? 'Showing sample data. Connect Nomba for live figures.'
                      : 'Dashboard updated with live Nomba data.'}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live data error banner */}
        {isConnected && !isDemo && nomba.error && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-status-warning/20 bg-status-warning-soft px-4 py-3">
            <p className="text-xs text-status-warning">Could not load live data: {nomba.error}</p>
            <button onClick={nomba.refresh} className="ml-3 text-xs font-semibold text-status-warning hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Live refresh button */}
        {isConnected && !isDemo && !nomba.loading && (
          <div className="mb-4 flex items-center justify-between">
            {nomba.account && (
              <p className="text-xs text-ink-muted">
                Connected as <span className="font-semibold text-ink-charcoal">{nomba.account.accountName}</span>
              </p>
            )}
            <button
              onClick={nomba.refresh}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-ink-muted transition-colors hover:bg-surface-muted"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${nomba.loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-8">
          <DashboardSlot ready={!isSyncing || loadedBusinessHealth} loading={<BusinessHealthCardSkeleton />}>
            <BusinessHealthCard />
          </DashboardSlot>

          <motion.section variants={item}>
            <SectionHeader
              title="Key Metrics"
              subtitle={isDemo ? 'Sample data — connect Nomba for live figures' : 'Live data from your Nomba account'}
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {displayKpis.map((kpi, index) => (
                <DashboardSlot
                  key={kpi.id}
                  ready={!isSyncing || index < loadedKpiCount}
                  loading={<KPICardSkeleton />}
                >
                  <KPICard kpi={kpi} />
                </DashboardSlot>
              ))}
            </div>
          </motion.section>

          <motion.section variants={item} className="card-base p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="section-title">Revenue Analytics</h2>
                <p className="text-sm text-ink-muted">Track revenue, sales, and growth trends</p>
              </div>
              <PeriodFilter active={period} onChange={setPeriod} />
            </div>
            <DashboardSlot ready={!isSyncing || loadedRevenueChart} loading={<AnalyticsChartSkeleton />}>
              <AnalyticsChart data={chartData} dataKey="revenue" />
            </DashboardSlot>
          </motion.section>

          <motion.section variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card-base p-6">
              <SectionHeader title="Sales Trend" subtitle="Daily sales volume" />
              <DashboardSlot ready={!isSyncing || loadedSalesChart} loading={<AnalyticsChartSkeleton />}>
                <AnalyticsChart data={chartData} dataKey="sales" color="#22C55E" height={220} />
              </DashboardSlot>
            </div>
            <div className="card-base p-6">
              <SectionHeader title="Transaction Volume" subtitle="Daily transaction count" />
              <DashboardSlot ready={!isSyncing || loadedCustomerChart} loading={<AnalyticsChartSkeleton />}>
                <AnalyticsChart data={chartData} dataKey="customers" color="#6366F1" height={220} />
              </DashboardSlot>
            </div>
          </motion.section>

          {/* Live transaction feed */}
          {isConnected && !isDemo && nomba.transactions.length > 0 && (
            <motion.section variants={item} className="card-base p-6">
              <SectionHeader title="Recent Transactions" subtitle="Last 10 transactions from your Nomba account" />
              <div className="mt-4 space-y-2">
                {nomba.transactions.slice(0, 10).map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between rounded-xl bg-surface-off px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-black capitalize">
                        {txn.type.replace('_', ' ')}
                      </p>
                      <p className="text-xs text-ink-muted">
                        {new Date(txn.timeCreated).toLocaleDateString('en-NG', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="ml-4 text-right">
                      <p className={`text-sm font-bold ${txn.status === 'SUCCESS' ? 'text-status-success' : 'text-status-danger'}`}>
                        ₦{txn.amount.toLocaleString('en-NG')}
                      </p>
                      <span className={`text-[10px] font-medium uppercase ${
                        txn.status === 'SUCCESS' ? 'text-status-success' : 'text-ink-muted'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </motion.div>
      </div>
    </NombaConnectOverlay>
  )
}
