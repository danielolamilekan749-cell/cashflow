import { motion } from 'framer-motion'
import { AlertTriangle, Flame, TrendingUp } from 'lucide-react'
import { products } from '../data/mockData'
import { formatCompact } from '../utils/format'

const statusConfig = {
  'best-seller': { label: 'Best Seller', color: 'bg-status-success-soft text-status-success' },
  trending: { label: 'Trending', color: 'bg-blue-50 text-blue-600' },
  slow: { label: 'Slow', color: 'bg-status-warning-soft text-status-warning' },
  attention: { label: 'Alert', color: 'bg-status-danger-soft text-status-danger' },
}

export default function Products() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h1 className="text-xl font-bold text-ink-black">Product Intelligence</h1>
        <p className="mt-0.5 text-sm text-ink-muted">
          AI-powered product performance and inventory insights
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
        {products.map((product, i) => {
          const status = statusConfig[product.status]
          const stockPercent = Math.min(product.stockLevel, 100)

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-base card-hover overflow-hidden"
            >
              <div className="relative h-24 bg-surface-muted sm:h-28">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <span
                  className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.color}`}
                >
                  {status.label}
                </span>
              </div>

              <div className="p-3">
                <h3 className="truncate text-sm font-bold text-ink-black">{product.name}</h3>

                <div className="mt-2.5 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-ink-muted">Revenue</p>
                    <p className="text-xs font-bold text-ink-black">
                      {formatCompact(product.revenue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Units</p>
                    <p className="text-xs font-bold text-ink-black">{product.unitsSold}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Margin</p>
                    <p className="text-xs font-bold text-status-success">{product.profitMargin}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-ink-muted">Stock</p>
                    <p className="text-xs font-bold text-ink-black">{product.stockLevel}</p>
                  </div>
                </div>

                <div className="mt-2.5">
                  <div className="h-1 overflow-hidden rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full ${
                        stockPercent < 20
                          ? 'bg-status-danger'
                          : stockPercent < 50
                            ? 'bg-status-warning'
                            : 'bg-status-success'
                      }`}
                      style={{ width: `${stockPercent}%` }}
                    />
                  </div>
                </div>

                {product.aiRecommendation && (
                  <div className="mt-2.5 flex items-start gap-1.5 rounded-lg bg-brand-yellow/10 p-2">
                    {product.status === 'attention' ? (
                      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-status-warning" />
                    ) : product.status === 'best-seller' ? (
                      <Flame className="mt-0.5 h-3 w-3 shrink-0 text-status-success" />
                    ) : (
                      <TrendingUp className="mt-0.5 h-3 w-3 shrink-0 text-brand-yellow-dark" />
                    )}
                    <p className="line-clamp-2 text-[10px] leading-relaxed text-ink-charcoal">
                      {product.aiRecommendation}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
