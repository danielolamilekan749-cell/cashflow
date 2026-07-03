import { motion } from 'framer-motion'
import { Gift, Phone, Tag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { customers } from '../data/mockData'
import { formatCompact } from '../utils/format'

type TierFilter = 'all' | 'gold' | 'silver' | 'bronze'

const tierConfig = {
  gold: { label: 'Gold', color: 'bg-brand-yellow/20 text-brand-yellow-dark border-brand-yellow/30' },
  silver: { label: 'Silver', color: 'bg-gray-100 text-ink-charcoal border-gray-200' },
  bronze: { label: 'Bronze', color: 'bg-orange-50 text-orange-700 border-orange-200' },
}

export default function Customers() {
  const [filter, setFilter] = useState<TierFilter>('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return customers
    return customers.filter((c) => c.tier === filter)
  }, [filter])

  const filters: { key: TierFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'gold', label: 'Gold' },
    { key: 'silver', label: 'Silver' },
    { key: 'bronze', label: 'Bronze' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl font-bold text-ink-black">Customer Intelligence</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          Segmented customer insights with AI-powered recommendations
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              filter === f.key
                ? 'bg-brand-yellow text-ink-black shadow-sm'
                : 'bg-white text-ink-muted hover:bg-surface-muted'
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
              <div className="flex items-center gap-2">
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-9 w-9 shrink-0 rounded-lg bg-surface-muted"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h3 className="truncate text-xs font-bold text-ink-black sm:text-sm">
                      {customer.name}
                    </h3>
                    <span
                      className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] font-bold sm:text-[9px] ${tier.color}`}
                    >
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
                  <p
                    className={`text-xs font-bold ${
                      customer.healthScore >= 70
                        ? 'text-status-success'
                        : customer.healthScore >= 50
                          ? 'text-status-warning'
                          : 'text-status-danger'
                    }`}
                  >
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
                  <Tag className="h-2.5 w-2.5" /> Coupon
                </button>
                <button className="flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-surface-muted">
                  <Phone className="h-2.5 w-2.5" />
                </button>
                <button className="flex items-center gap-0.5 rounded-md border border-gray-200 px-2 py-1 text-[10px] font-semibold text-ink-muted hover:bg-surface-muted">
                  <Gift className="h-2.5 w-2.5" />
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
