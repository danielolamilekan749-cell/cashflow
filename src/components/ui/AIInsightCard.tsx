import { AlertTriangle, ArrowRight, Info, Sparkles, TrendingUp } from 'lucide-react'
import type { AIInsight } from '../../types'

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bg: 'bg-status-warning-soft',
    iconColor: 'text-status-warning',
    border: 'border-status-warning/20',
  },
  success: {
    icon: TrendingUp,
    bg: 'bg-status-success-soft',
    iconColor: 'text-status-success',
    border: 'border-status-success/20',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    border: 'border-blue-100',
  },
  alert: {
    icon: Sparkles,
    bg: 'bg-brand-yellow/10',
    iconColor: 'text-brand-yellow-dark',
    border: 'border-brand-yellow/30',
  },
}

export default function AIInsightCard({ insight }: { insight: AIInsight }) {
  const config = typeConfig[insight.type]
  const Icon = config.icon

  return (
    <div
      className={`card-base card-hover group flex flex-col gap-3 border p-5 ${config.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-semibold text-ink-black">{insight.title}</h4>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{insight.description}</p>
        </div>
      </div>
      {insight.action && (
        <button className="group/btn flex items-center gap-1 self-start text-sm font-semibold text-brand-yellow-dark transition-colors hover:text-ink-black">
          {insight.action}
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      )}
    </div>
  )
}
