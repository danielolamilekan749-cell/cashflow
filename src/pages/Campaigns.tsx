import { motion } from 'framer-motion'
import { Gift, Megaphone, Pause, Play, Plus, RefreshCw, Sun } from 'lucide-react'
import { campaigns } from '../data/mockData'
import { formatCurrency } from '../utils/format'

const typeIcons = {
  discount: Megaphone,
  loyalty: Gift,
  reengagement: RefreshCw,
  birthday: Gift,
  seasonal: Sun,
}

const typeLabels = {
  discount: 'Discount',
  loyalty: 'Loyalty',
  reengagement: 'Re-engagement',
  birthday: 'Birthday',
  seasonal: 'Seasonal',
}

export default function Campaigns() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Smart Campaigns</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Create and track marketing campaigns for your customers
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {campaigns.map((campaign, i) => {
          const Icon = typeIcons[campaign.type]
          const isActive = campaign.status === 'active'

          return (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-base card-hover p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-yellow/15">
                    <Icon className="h-5 w-5 text-brand-yellow-dark" />
                  </div>
                  <div>
                    <h3 className="font-bold text-ink-black">{campaign.name}</h3>
                    <p className="text-xs text-ink-muted">{typeLabels[campaign.type]} Campaign</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                    isActive
                      ? 'bg-status-success-soft text-status-success'
                      : campaign.status === 'paused'
                        ? 'bg-status-warning-soft text-status-warning'
                        : 'bg-gray-100 text-ink-muted'
                  }`}
                >
                  {campaign.status}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-ink-muted">Open Rate</p>
                  <p className="mt-0.5 text-lg font-bold text-ink-black">{campaign.openRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Redemption</p>
                  <p className="mt-0.5 text-lg font-bold text-ink-black">{campaign.redemptionRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Revenue</p>
                  <p className="mt-0.5 text-lg font-bold text-status-success">
                    {formatCurrency(campaign.revenueGenerated)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-ink-muted hover:bg-surface-muted">
                  {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {isActive ? 'Pause' : 'Resume'}
                </button>
                <button className="flex-1 rounded-xl bg-brand-yellow/15 py-2 text-xs font-semibold text-ink-black hover:bg-brand-yellow/25">
                  View Details
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
