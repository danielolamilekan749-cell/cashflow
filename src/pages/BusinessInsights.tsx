import { motion } from 'framer-motion'
import AnalyticsChart, { PeriodFilter } from '../components/charts/AnalyticsChart'
import AIInsightCard from '../components/ui/AIInsightCard'
import HealthScoreRing from '../components/ui/HealthScoreRing'
import SectionHeader from '../components/ui/SectionHeader'
import { aiInsights, businessHealth as mockHealth, monthlyChartData as mockMonthly, revenueChartData as mockRevenue } from '../data/mockData'
import { useMerchant } from '../hooks/useMerchant'
import { useNombaData } from '../hooks/useNombaData'
import { useState } from 'react'
import type { ChartPeriod } from '../types'

export default function BusinessInsights() {
  const [period, setPeriod] = useState<ChartPeriod>('30d')
  const merchant = useMerchant()
  const nomba = useNombaData()

  const chartData = period === '12m'
    ? (merchant.isDemo || nomba.monthlyChartData.length === 0 ? mockMonthly : nomba.monthlyChartData)
    : (merchant.isDemo || nomba.chartData.length === 0 ? mockRevenue : nomba.chartData)

  // Derive live health score from transactions
  const health = (() => {
    if (merchant.isDemo) return mockHealth
    const txns = nomba.transactions.filter(t => t.status === 'SUCCESS')
    if (txns.length === 0) return mockHealth
    const score = Math.min(100, Math.round((txns.length / Math.max(nomba.transactions.length, 1)) * 60 + Math.min(txns.length, 50) * 0.8))
    return {
      score,
      percentile: Math.round(score * 0.9),
      summary: merchant.isSandbox
        ? `Sandbox mode: ${txns.length} test transactions loaded.`
        : `${txns.length} live transactions. Your revenue data is real-time.`,
    }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-ink-black">Business Insights</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {merchant.isDemo
            ? 'AI-powered analysis — connect Nomba for live insights'
            : `Live analysis for ${merchant.name}`}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-base flex flex-col items-center p-6 lg:col-span-1">
          <HealthScoreRing score={health.score} size={140} />
          <p className="mt-4 text-center text-sm text-ink-muted">{health.summary}</p>
          {!merchant.isDemo && (
            <span className="mt-3 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              {merchant.isSandbox ? '● Sandbox data' : '● Live data'}
            </span>
          )}
        </div>

        <div className="card-base p-6 lg:col-span-2">
          <SectionHeader title="Profit Trend" subtitle="Net profit over time" />
          <AnalyticsChart data={chartData} dataKey="profit" color="#22C55E" height={240} />
        </div>
      </div>

      <div className="card-base p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Revenue Trend"
            subtitle={merchant.isDemo ? 'Sample data' : 'Live from Nomba'}
          />
          <PeriodFilter active={period} onChange={setPeriod} />
        </div>
        <AnalyticsChart data={chartData} dataKey="revenue" />
      </div>

      <div>
        <SectionHeader
          title="AI Recommendations"
          subtitle="Actionable insights to grow your business"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {aiInsights.map((insight) => (
            <AIInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      </div>
    </motion.div>
  )
}
