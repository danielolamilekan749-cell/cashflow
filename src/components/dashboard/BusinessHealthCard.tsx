import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { businessHealth as mockHealth } from '../../data/mockData'
import { useMerchant } from '../../hooks/useMerchant'
import { useNombaData } from '../../hooks/useNombaData'
import HealthScoreRing from '../ui/HealthScoreRing'

export default function BusinessHealthCard() {
  const merchant = useMerchant()
  const nomba = useNombaData()

  // Derive a real health score from live transaction data
  const health = (() => {
    if (merchant.isDemo) return mockHealth

    const txns = nomba.transactions.filter(t => t.status === 'SUCCESS')
    if (txns.length === 0) return mockHealth

    const total = txns.reduce((s, t) => s + t.amount, 0)
    const successRate = txns.length / Math.max(nomba.transactions.length, 1)
    // Score: weighted by success rate + having transactions at all
    const score = Math.min(100, Math.round(successRate * 60 + Math.min(txns.length, 50) * 0.8))
    const percentile = Math.round(score * 0.9)

    return {
      score,
      percentile,
      summary: `Your account has ${txns.length} successful transactions totalling ₦${(total / 1000).toFixed(0)}K. Connected to Nomba ${merchant.isSandbox ? 'sandbox' : 'live'}.`,
    }
  })()

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-base relative overflow-hidden p-4 lg:flex lg:items-center lg:gap-8 lg:p-6"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border-[20px] border-brand-yellow/15" />
      <div className="pointer-events-none absolute -left-6 bottom-0 h-28 w-28 rounded-full border-[14px] border-brand-yellow/10 lg:hidden" />

      <div className="relative flex flex-col items-center lg:shrink-0">
        <HealthScoreRing score={health.score} size={140} strokeWidth={14} />
      </div>

      <div className="relative mt-4 flex flex-1 flex-col lg:mt-0">
        <div className="mb-2 flex items-center gap-1.5 lg:mb-3">
          <Sparkles className="h-4 w-4 text-brand-yellow-dark" />
          <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
            Business Health
          </span>
          {!merchant.isDemo && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
              {merchant.isSandbox ? 'Sandbox data' : 'Live data'}
            </span>
          )}
        </div>

        <h2 className="text-center text-base font-bold text-ink-black lg:text-left lg:text-lg">
          {merchant.isDemo ? 'Your Business Health Score' : `${merchant.name} Health`}
        </h2>

        <p className="mt-1.5 text-center text-xs leading-relaxed text-ink-muted lg:mt-2 lg:text-left lg:text-sm">
          {health.summary}
        </p>

        <div className="mt-3 flex flex-col items-center gap-3 sm:flex-row sm:justify-between lg:mt-4">
          <span className="inline-flex items-center rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-yellow-dark">
            Top {health.percentile}% of merchants
          </span>
          <Link to="/insights" className="btn-primary w-full py-2 px-4 text-xs sm:w-auto">
            View Insights
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
