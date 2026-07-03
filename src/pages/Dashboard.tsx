import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
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
import {
  kpis,
  monthlyChartData,
  revenueChartData,
} from '../data/mockData'
import type { ChartPeriod } from '../types'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
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
  const { isSyncing, session, completeSync } = useNombaConnection()
  const [period, setPeriod] = useState<ChartPeriod>('7d')
  const [loadedBusinessHealth, setLoadedBusinessHealth] = useState(false)
  const [loadedKpiCount, setLoadedKpiCount] = useState(0)
  const [loadedRevenueChart, setLoadedRevenueChart] = useState(false)
  const [loadedSalesChart, setLoadedSalesChart] = useState(false)
  const [loadedCustomerChart, setLoadedCustomerChart] = useState(false)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const chartData = period === '12m' ? monthlyChartData : revenueChartData

  useEffect(() => {
    if (!isSyncing) {
      return
    }

    setLoadedBusinessHealth(false)
    setLoadedKpiCount(0)
    setLoadedRevenueChart(false)
    setLoadedSalesChart(false)
    setLoadedCustomerChart(false)
    setShowSuccessAlert(false)

    if (!session) {
      return
    }

    const timeouts: number[] = []

    const schedule = (callback: () => void, delay: number) => {
      const timeoutId = window.setTimeout(callback, delay)
      timeouts.push(timeoutId)
    }

    let delay = 220
    schedule(() => setLoadedBusinessHealth(true), delay)

    kpis.forEach((_, index) => {
      delay += 140
      schedule(() => setLoadedKpiCount(index + 1), delay)
    })

    delay += 180
    schedule(() => setLoadedRevenueChart(true), delay)

    delay += 160
    schedule(() => setLoadedSalesChart(true), delay)

    delay += 160
    schedule(() => setLoadedCustomerChart(true), delay)

    delay += 220
    schedule(() => {
      setShowSuccessAlert(true)
      completeSync()
    }, delay)

    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId))
    }
  }, [completeSync, isSyncing, session])

  useEffect(() => {
    if (!showSuccessAlert) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      setShowSuccessAlert(false)
    }, 2600)

    return () => {
      window.clearTimeout(timeoutId)
    }
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
                  <p className="text-sm font-semibold text-ink-black">Sync completed successfully</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    Your dashboard cards are now fully updated with the latest business data.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 lg:space-y-8">
          <DashboardSlot ready={!isSyncing || loadedBusinessHealth} loading={<BusinessHealthCardSkeleton />}>
            <BusinessHealthCard />
          </DashboardSlot>

          <motion.section variants={item}>
            <SectionHeader
              title="Key Metrics"
              subtitle="Real-time business performance at a glance"
            />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {kpis.map((kpi, index) => (
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
            <DashboardSlot
              ready={!isSyncing || loadedRevenueChart}
              loading={<AnalyticsChartSkeleton />}
            >
              <AnalyticsChart data={chartData} dataKey="revenue" />
            </DashboardSlot>
          </motion.section>

          <motion.section variants={item} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card-base p-6">
              <SectionHeader title="Sales Trend" subtitle="Daily sales volume" />
              <DashboardSlot
                ready={!isSyncing || loadedSalesChart}
                loading={<AnalyticsChartSkeleton />}
              >
                <AnalyticsChart data={chartData} dataKey="sales" color="#22C55E" height={220} />
              </DashboardSlot>
            </div>
            <div className="card-base p-6">
              <SectionHeader title="Customer Growth" subtitle="New and returning customers" />
              <DashboardSlot
                ready={!isSyncing || loadedCustomerChart}
                loading={<AnalyticsChartSkeleton />}
              >
                <AnalyticsChart data={chartData} dataKey="customers" color="#6366F1" height={220} />
              </DashboardSlot>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </NombaConnectOverlay>
  )
}
