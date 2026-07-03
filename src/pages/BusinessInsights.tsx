import { motion } from 'framer-motion'
import AnalyticsChart, { PeriodFilter } from '../components/charts/AnalyticsChart'
import AIInsightCard from '../components/ui/AIInsightCard'
import HealthScoreRing from '../components/ui/HealthScoreRing'
import SectionHeader from '../components/ui/SectionHeader'
import {
  aiInsights,
  businessHealth,
  monthlyChartData,
  revenueChartData,
} from '../data/mockData'
import { useState } from 'react'
import type { ChartPeriod } from '../types'

export default function BusinessInsights() {
  const [period, setPeriod] = useState<ChartPeriod>('30d')
  const chartData = period === '12m' ? monthlyChartData : revenueChartData

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-ink-black">Business Insights</h1>
        <p className="mt-1 text-sm text-ink-muted">
          AI-powered analysis of your business performance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-base flex flex-col items-center p-6 lg:col-span-1">
          <HealthScoreRing score={businessHealth.score} size={140} />
          <p className="mt-4 text-center text-sm text-ink-muted">{businessHealth.summary}</p>
        </div>

        <div className="card-base p-6 lg:col-span-2">
          <SectionHeader title="Profit Trend" subtitle="Net profit over time" />
          <AnalyticsChart data={chartData} dataKey="profit" color="#22C55E" height={240} />
        </div>
      </div>

      <div className="card-base p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader title="Revenue Trend" subtitle="Detailed revenue analysis" />
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
