import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartPeriod } from '../../types'
import { formatCompact } from '../../utils/format'

type AnalyticsChartProps = {
  data: Record<string, string | number>[]
  dataKey: string
  color?: string
  height?: number
}

export default function AnalyticsChart({
  data,
  dataKey,
  color = '#F5C84C',
  height = 280,
}: AnalyticsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`chart-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#9CA3AF' }}
          tickFormatter={(v) => formatCompact(v as number)}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #F3F4F6',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            fontSize: 13,
          }}
          formatter={(value) => [formatCompact(Number(value ?? 0)), dataKey]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#chart-${dataKey})`}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export const periodLabels: Record<ChartPeriod, string> = {
  today: 'Today',
  '7d': '7 Days',
  '30d': '30 Days',
  '90d': '90 Days',
  '12m': '12 Months',
}

export function PeriodFilter({
  active,
  onChange,
}: {
  active: ChartPeriod
  onChange: (p: ChartPeriod) => void
}) {
  const periods: ChartPeriod[] = ['today', '7d', '30d', '90d', '12m']

  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-surface-muted p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
            active === p
              ? 'bg-white text-ink-black shadow-sm'
              : 'text-ink-muted hover:text-ink-charcoal'
          }`}
        >
          {periodLabels[p]}
        </button>
      ))}
    </div>
  )
}
