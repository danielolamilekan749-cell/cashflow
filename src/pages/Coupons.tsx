import { motion } from 'framer-motion'
import { Copy, Plus, Tag } from 'lucide-react'

const coupons = [
  { id: '1', code: 'WEEKEND20', discount: '20% off', uses: 48, maxUses: 100, status: 'active', expires: 'Jun 30, 2025' },
  { id: '2', code: 'GOLDVIP15', discount: '₦1,500 off', uses: 23, maxUses: 50, status: 'active', expires: 'Jul 15, 2025' },
  { id: '3', code: 'RAINY10', discount: '10% off', uses: 89, maxUses: 200, status: 'active', expires: 'Aug 1, 2025' },
  { id: '4', code: 'COMEBACK25', discount: '25% off', uses: 12, maxUses: 30, status: 'expired', expires: 'May 31, 2025' },
]

export default function Coupons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Coupons</h1>
          <p className="mt-1 text-sm text-ink-muted">Create and manage discount coupons</p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {coupons.map((coupon, i) => (
          <motion.div
            key={coupon.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-base card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-yellow/15">
                  <Tag className="h-5 w-5 text-brand-yellow-dark" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <code className="font-bold text-ink-black">{coupon.code}</code>
                    <button className="text-ink-light hover:text-ink-charcoal">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm text-ink-muted">{coupon.discount}</p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                  coupon.status === 'active'
                    ? 'bg-status-success-soft text-status-success'
                    : 'bg-gray-100 text-ink-muted'
                }`}
              >
                {coupon.status}
              </span>
            </div>

            <div className="mt-4">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-ink-muted">Usage</span>
                <span className="font-semibold">
                  {coupon.uses}/{coupon.maxUses}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full bg-brand-yellow"
                  style={{ width: `${(coupon.uses / coupon.maxUses) * 100}%` }}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-ink-light">Expires {coupon.expires}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
