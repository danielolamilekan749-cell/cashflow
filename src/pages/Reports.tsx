import { motion } from 'framer-motion'
import { ArrowDownUp, Download, FileText, RefreshCw, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import AnalyticsChart, { PeriodFilter } from '../components/charts/AnalyticsChart'
import SectionHeader from '../components/ui/SectionHeader'
import { useNombaData } from '../hooks/useNombaData'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { monthlyChartData as mockMonthly, revenueChartData as mockRevenue } from '../data/mockData'
import type { ChartPeriod } from '../types'

const reportTypes = [
  { id: '1', name: 'Revenue Report', description: 'Detailed revenue breakdown by period', icon: TrendingUp },
  { id: '2', name: 'Transaction Report', description: 'All transactions with status and type', icon: ArrowDownUp },
  { id: '3', name: 'Product Report', description: 'Product performance and inventory analysis', icon: FileText },
  { id: '4', name: 'Debt Report', description: 'Outstanding debts and payment history', icon: FileText },
]

function exportCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

export default function Reports() {
  const { session } = useNombaConnection()
  const nomba = useNombaData()
  const [period, setPeriod] = useState<ChartPeriod>('30d')

  const isDemo = session?.demoMode ?? true
  const chartData = period === '12m'
    ? (isDemo || nomba.monthlyChartData.length === 0 ? mockMonthly : nomba.monthlyChartData)
    : (isDemo || nomba.chartData.length === 0 ? mockRevenue : nomba.chartData)

  const handleExport = (reportId: string) => {
    if (isDemo) {
      alert('Connect your Nomba account to export real data.')
      return
    }
    if (reportId === '1') {
      exportCSV(chartData as unknown as Record<string, unknown>[], 'revenue-report.csv')
    } else if (reportId === '2') {
      exportCSV(
        nomba.transactions.map((t) => ({
          id: t.id, status: t.status, amount: t.amount,
          type: t.type, source: t.source, date: t.timeCreated,
        })),
        'transactions-report.csv',
      )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Reports</h1>
          <p className="mt-1 text-sm text-ink-muted">Generate and export business reports</p>
        </div>
        {!isDemo && (
          <button
            onClick={nomba.refresh}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-muted"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${nomba.loading ? 'animate-spin' : ''}`} />
            Refresh data
          </button>
        )}
      </div>

      {/* Summary stats */}
      {!isDemo && nomba.kpis.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {nomba.kpis.slice(0, 4).map((kpi) => (
            <div key={kpi.id} className="card-base p-4">
              <p className="text-xs text-ink-muted">{kpi.label}</p>
              <p className="mt-1 text-lg font-bold text-ink-black">{kpi.value}</p>
              {kpi.change !== 0 && (
                <p className={`text-xs font-medium ${kpi.change >= 0 ? 'text-status-success' : 'text-status-danger'}`}>
                  {kpi.change >= 0 ? '+' : ''}{kpi.change}% {kpi.changeLabel}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

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
            <button
              onClick={() => handleExport(report.id)}
              className="btn-secondary shrink-0 px-3 py-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </motion.div>
        ))}
      </div>

      <div className="card-base p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader
            title="Revenue Overview"
            subtitle={isDemo ? 'Sample data — connect Nomba for live figures' : 'Live from your Nomba account'}
          />
          <PeriodFilter active={period} onChange={setPeriod} />
        </div>
        <AnalyticsChart data={chartData} dataKey="revenue" />
      </div>

      {/* Live transaction table */}
      {!isDemo && nomba.transactions.length > 0 && (
        <div className="card-base overflow-hidden p-0">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="font-semibold text-ink-black">Transaction History</h2>
            <p className="text-xs text-ink-muted">{nomba.transactions.length} transactions loaded</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-surface-off text-left">
                  {['Date', 'Type', 'Amount', 'Status', 'Source'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-ink-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nomba.transactions.slice(0, 20).map((txn) => (
                  <tr key={txn.id} className="hover:bg-surface-off">
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {new Date(txn.timeCreated).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-surface-muted px-2 py-0.5 text-xs font-medium capitalize text-ink-charcoal">
                        {txn.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink-black">
                      ₦{txn.amount.toLocaleString('en-NG')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        txn.status === 'SUCCESS'
                          ? 'bg-status-success-soft text-status-success'
                          : 'bg-status-danger-soft text-status-danger'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-ink-muted">{txn.source ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  )
}
