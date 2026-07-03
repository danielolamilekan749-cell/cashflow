import { motion } from 'framer-motion'
import { Download, FileText, TrendingUp } from 'lucide-react'
import AnalyticsChart, { PeriodFilter } from '../components/charts/AnalyticsChart'
import SectionHeader from '../components/ui/SectionHeader'
import { monthlyChartData, revenueChartData } from '../data/mockData'
import { useState } from 'react'
import type { ChartPeriod } from '../types'

const reportTypes = [
  { id: '1', name: 'Revenue Report', description: 'Detailed revenue breakdown by period', icon: TrendingUp },
  { id: '2', name: 'Customer Report', description: 'Customer acquisition and retention metrics', icon: FileText },
  { id: '3', name: 'Product Report', description: 'Product performance and inventory analysis', icon: FileText },
  { id: '4', name: 'Debt Report', description: 'Outstanding debts and payment history', icon: FileText },
]

export default function Reports() {
  const [period, setPeriod] = useState<ChartPeriod>('30d')
  const chartData = period === '12m' ? monthlyChartData : revenueChartData

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-ink-black">Reports</h1>
        <p className="mt-1 text-sm text-ink-muted">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reportTypes.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base card-hover flex items-center gap-4 p-5"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow/15">
              <report.icon className="h-5 w-5 text-brand-yellow-dark" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-ink-black">{report.name}</h3>
              <p className="text-xs text-ink-muted">{report.description}</p>
            </div>
            <button className="btn-secondary shrink-0 px-3 py-2 text-xs">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </motion.div>
        ))}
      </div>

      <div className="card-base p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader title="Revenue Overview" subtitle="Visual report preview" />
          <PeriodFilter active={period} onChange={setPeriod} />
        </div>
        <AnalyticsChart data={chartData} dataKey="revenue" />
      </div>
    </motion.div>
  )
}
