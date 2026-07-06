import { motion } from 'framer-motion'
import { Bot, Gift, Phone, Sparkles, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNombaData } from '../hooks/useNombaData'
import { useNombaConnection } from '../context/NombaConnectionContext'
import { customers as mockCustomers } from '../data/mockData'
import { sendToGroq } from '../lib/ai/groq'
import { formatCompact } from '../utils/format'
import type { Customer } from '../types'
import type { NombaTransaction } from '../lib/nomba/api'

type TierFilter = 'all' | 'gold' | 'silver' | 'bronze'

const tierConfig = {
  gold: { label: 'Gold', color: 'bg-brand-yellow/20 text-brand-yellow-dark border-brand-yellow/30' },
  silver: { label: 'Silver', color: 'bg-gray-100 text-ink-charcoal border-gray-200' },
  bronze: { label: 'Bronze', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

/** Rank customers from live Nomba transactions by total spend */
function rankFromTransactions(txns: NombaTransaction[]): Customer[] {
  const successTxns = txns.filter((t) => t.status === 'SUCCESS')
  if (successTxns.length === 0) return []

  // Group by merchantTxRef prefix or ID prefix as a proxy for unique customers
  // In real Nomba data each transaction has a userId or similar — we bucket by rrn prefix
  const spendMap = new Map<string, { total: number; count: number; last: string }>()

  successTxns.forEach((t) => {
    // Use first 8 chars of transaction ID as a customer proxy key
    const key = (t.rrn ?? t.id ?? '').slice(0, 8) || 'unknown'
    const existing = spendMap.get(key) ?? { total: 0, count: 0, last: t.timeCreated }
    spendMap.set(key, {
      total: existing.total + t.amount,
      count: existing.count + 1,
      last: t.timeCreated > existing.last ? t.timeCreated : existing.last,
    })
  })

  const sorted = [...spendMap.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 12)

  const maxSpend = sorted[0]?.[1].total ?? 1

  return sorted.map(([key, data], i) => {
    const spendRatio = data.total / maxSpend
    const tier: Customer['tier'] = spendRatio >= 0.6 ? 'gold' : spendRatio >= 0.3 ? 'silver' : 'bronze'
    const healthScore = Math.min(100, Math.round(spendRatio * 70 + (data.count / successTxns.length) * 30 * 100))
    const daysSinceLast = Math.round((Date.now() - new Date(data.last).getTime()) / 86400000)
    const lastLabel = daysSinceLast === 0 ? 'Today' : daysSinceLast === 1 ? 'Yesterday' : `${daysSinceLast} days ago`

    return {
      id: key,
      name: `Customer #${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${key}`,
      tier,
      totalSpend: data.total,
      lastPurchase: lastLabel,
      frequencyScore: Math.min(100, Math.round((data.count / Math.max(...[...spendMap.values()].map((v) => v.count))) * 100)),
      loyaltyRating: Math.min(100, Math.round(spendRatio * 100)),
      healthScore,
    }
  })
}

export default function Customers() {
  const { session } = useNombaConnection()
  const nomba = useNombaData()
  const isDemo = session?.demoMode ?? true

  // Use AI-ranked live customers when connected, else mock
  const liveCustomers = useMemo(() => {
    if (isDemo || nomba.transactions.length === 0) return mockCustomers
    const ranked = rankFromTransactions(nomba.transactions)
    return ranked.length > 0 ? ranked : mockCustomers
  }, [isDemo, nomba.transactions])

  const [filter, setFilter] = useState<TierFilter>('all')
  const [aiInsight, setAiInsight] = useState<string | null>(null)
  const [insightLoading, setInsightLoading] = useState(false)
  const insightGenerated = useRef(false)

  const filtered = useMemo(() => {
    if (filter === 'all') return liveCustomers
    return liveCustomers.filter((c) => c.tier === filter)
  }, [liveCustomers, filter])

  const goldCount = liveCustomers.filter((c) => c.tier === 'gold').length
  const totalSpend = liveCustomers.reduce((s, c) => s + c.totalSpend, 0)
  const avgHealth = liveCustomers.length > 0
    ? Math.round(liveCustomers.reduce((s, c) => s + c.healthScore, 0) / liveCustomers.length)
    : 0

  // Generate AI customer insight once
  useEffect(() => {
    if (insightGenerated.current || liveCustomers.length === 0) return
    insightGenerated.current = true
    setInsightLoading(true)

    const top3 = liveCustomers.slice(0, 3)
    const prompt = `Give a 2-sentence AI insight about this merchant's customer base. Top customers: ${top3.map((c, i) => `${i + 1}. ${c.name} (${c.tier}, ₦${c.totalSpend.toLocaleString()} spend, health ${c.healthScore}/100)`).join('; ')}. Total customers: ${liveCustomers.length}, avg health: ${avgHealth}/100. Be specific and actionable.`

    sendToGroq([{ role: 'user', content: prompt }])
      .then((r) => setAiInsight(r))
      .catch(() => setAiInsight(null))
      .finally(() => setInsightLoading(false))
  }, [liveCustomers, avgHealth])

  const filters: { key: TierFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'bronze', label: 'Bronze' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink-black">Customer Intelligence</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          {isDemo
            ? 'AI-ranked customers from sample data'
            : `AI-ranked from ${nomba.transactions.length} live transactions`}
        </p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total', value: String(liveCustomers.length), icon: TrendingUp },
          { label: 'Gold tier', value: String(goldCount), icon: TrendingUp },
          { label: 'Avg health', value: `${avgHealth}/100`, icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className="card-base px-3 py-2.5">
            <p className="text-[10px] text-ink-muted">{s.label}</p>
            <p className="text-sm font-bold text-ink-black">{s.value}</p>
          </div>
        ))}
      </div>

      {/* AI insight banner */}
      {(insightLoading || aiInsight) && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-brand-yellow/25 bg-brand-yellow/8 px-4 py-3"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/20">
              {insightLoading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Bot className="h-4 w-4 text-brand-yellow-dark" />
                </motion.div>
              ) : (
                <Sparkles className="h-4 w-4 text-brand-yellow-dark" />
              )}
            </div>
            <div>
              <p className="mb-0.5 text-xs font-bold text-ink-black">AI Customer Insight</p>
              {insightLoading ? (
                <p className="text-xs text-ink-muted">Analysing your customers...</p>
              ) : (
                <p className="text-xs leading-relaxed text-ink-charcoal"
                  dangerouslySetInnerHTML={{ __html: (aiInsight ?? '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Ranking note */}
      {!isDemo && nomba.transactions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <TrendingUp className="h-3.5 w-3.5 text-brand-yellow-dark" />
          Customers ranked by total transaction spend — highest spenders shown first
        </div>
      )}

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f.key ? 'bg-brand-yellow text-ink-black shadow-sm' : 'bg-white text-ink-muted hover:bg-surface-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {filtered.map((customer, i) => {
          const tier = tierConfig[customer.tier]
          return (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card-base card-hover p-3.5"
            >
              {/* Rank badge */}
              {i < 3 && filter === 'all' && (
                <div className="mb-2 flex items-center gap-1">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    i === 0 ? 'bg-brand-yellow text-ink-black' :
                    i === 1 ? 'bg-gray-200 text-ink-charcoal' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    #{i + 1} {i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <img src={customer.avatar} alt={customer.name} className="h-9 w-9 shrink-0 rounded-lg bg-surface-muted" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-xs font-bold text-ink-black sm:text-sm">{customer.name}</h3>
                    <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-bold sm:text-[9px] ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-muted">Last: {customer.lastPurchase}</p>
                </div>
              </div>

              <div className="mt-2.5 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-ink-muted">Spend</p>
                  <p className="text-xs font-bold">{formatCompact(customer.totalSpend)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Health</p>
                  <p className={`text-xs font-bold ${
                    customer.healthScore >= 70 ? 'text-status-success' :
                    customer.healthScore >= 50 ? 'text-status-warning' : 'text-status-danger'
                  }`}>
                    {customer.healthScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Frequency</p>
                  <p className="text-xs font-bold">{customer.frequencyScore}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-ink-muted">Loyalty</p>
                  <p className="text-xs font-bold">{customer.loyaltyRating}%</p>
                </div>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1">
                <button className="flex items-center gap-0.5 rounded-md bg-brand-yellow/15 px-2 py-1 text-[10px] font-semibold text-ink-black hover:bg-brand-yellow/25">
                  <Gift className="h-2.5 w-2.5" /> Reward
                </button>
                <button className="flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-surface-muted">
                  <Phone className="h-2.5 w-2.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
