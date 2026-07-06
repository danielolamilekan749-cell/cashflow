import { Bell, Bot, Search, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMerchant } from '../../hooks/useMerchant'
import { useNombaData } from '../../hooks/useNombaData'
import { formatCurrency } from '../../utils/format'

export default function TopNav() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'

  const merchant = useMerchant()
  const nomba = useNombaData()

  // Today's revenue: use live data if available, else 0 (not fake ₦284k)
  const todayRevenue = (() => {
    if (merchant.isDemo) return null
    const today = new Date().toDateString()
    const total = nomba.transactions
      .filter(t => t.status === 'SUCCESS' && new Date(t.timeCreated).toDateString() === today)
      .reduce((s, t) => s + t.amount, 0)
    return total
  })()

  return (
    <header className="sticky top-0 z-30 border-b border-white/20 bg-white/70 backdrop-blur-xl lg:border-gray-100/80 lg:bg-white/80">
      <div className="flex items-center gap-3 px-4 py-3 lg:px-6 lg:py-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink-black">
            {greeting}, {merchant.owner} 👋
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-ink-muted">{merchant.name}</p>
            {merchant.isLive && (
              <span className="rounded-full bg-status-success-soft px-2 py-0.5 text-[10px] font-bold text-status-success">
                ● Live
              </span>
            )}
            {merchant.isSandbox && (
              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600">
                ● Sandbox
              </span>
            )}
            {merchant.isDemo && (
              <span className="rounded-full bg-brand-yellow/15 px-2 py-0.5 text-[10px] font-bold text-brand-yellow-dark">
                Demo
              </span>
            )}
          </div>
        </div>

        <div className="relative hidden flex-1 md:block md:max-w-md lg:max-w-sm xl:max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-light" />
          <input
            type="search"
            placeholder="Search customers, products, reports..."
            className="input-base pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Today's revenue — only show when real data is available */}
          {todayRevenue !== null && (
            <div className="hidden items-center gap-1.5 rounded-xl bg-brand-yellow/15 px-3 py-1.5 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-brand-yellow-dark" />
              <span className="text-xs font-bold text-ink-black">
                {formatCurrency(todayRevenue)}
              </span>
              <span className="text-[10px] font-medium text-ink-muted">today</span>
            </div>
          )}

          <Link
            to="/ai-assistant"
            className="hidden items-center gap-1.5 rounded-xl bg-ink-black px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-ink-charcoal sm:flex"
          >
            <Bot className="h-3.5 w-3.5" />
            Ask AI
          </Link>

          <Link
            to="/notifications"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 text-ink-muted transition-colors hover:bg-surface-muted"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-status-danger ring-2 ring-white" />
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-2.5 rounded-xl border border-gray-100 py-1 pl-1 pr-3 transition-colors hover:bg-surface-muted"
          >
            <img
              src={merchant.avatar}
              alt={merchant.owner}
              className="h-8 w-8 rounded-lg bg-surface-muted object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-ink-black">{merchant.owner}</p>
              <p className="text-[10px] text-ink-muted">
                {merchant.isDemo ? 'Connect Nomba' : 'View profile'}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
