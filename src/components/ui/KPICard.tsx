import { TrendingDown, TrendingUp } from 'lucide-react'
import type { KPI } from '../../types'
import Sparkline from './Sparkline'

const accentColors = {
  default: '#F5C84C',
  success: '#22C55E',
  warning: '#F97316',
  danger: '#EF4444',
}

const iconBg = {
  default: 'bg-brand-yellow/15 text-brand-yellow-dark',
  success: 'bg-status-success-soft text-status-success',
  warning: 'bg-status-warning-soft text-status-warning',
  danger: 'bg-status-danger-soft text-status-danger',
}

export default function KPICard({ kpi }: { kpi: KPI }) {
  const accent = kpi.accent ?? 'default'
  const isPositive = kpi.change >= 0
  const sparkColor = accentColors[accent]

  return (
    <div className="card-base card-hover group flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg[accent]}`}>
          <kpi.icon className="h-4.5 w-4.5" strokeWidth={2} />
        </div>
        <div
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isPositive
              ? 'bg-status-success-soft text-status-success'
              : 'bg-status-danger-soft text-status-danger'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {Math.abs(kpi.change).toFixed(1)}%
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-ink-muted">{kpi.label}</p>
        <p className="metric-value mt-0.5 text-lg">{kpi.value}</p>
        <p className="mt-0.5 text-xs text-ink-light">{kpi.changeLabel}</p>
      </div>

      <div className="mt-auto opacity-70 transition-opacity group-hover:opacity-100">
        <Sparkline data={kpi.sparkline} color={sparkColor} />
      </div>
    </div>
  )
}
