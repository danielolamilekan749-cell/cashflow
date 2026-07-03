import { AnimatePresence, motion } from 'framer-motion'
import {
  BarChart3,
  Bell,
  Bot,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MoreHorizontal,
  Package,
  Settings,
  User,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

const primaryNavItems = [
  { label: 'Home', path: '/', icon: LayoutDashboard },
  { label: 'AI', path: '/ai-assistant', icon: Bot },
  { label: 'Customers', path: '/customers', icon: Users },
  { label: 'Debts', path: '/debts', icon: CreditCard },
]

const moreNavItems = [
  { label: 'Business Insights', path: '/insights', icon: Lightbulb },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'My Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
]

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)

  const closeMore = () => setMoreOpen(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1">
          {primaryNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors ${
                  isActive ? 'text-brand-yellow-dark' : 'text-ink-light'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                      isActive ? 'bg-brand-yellow/20' : ''
                    }`}
                  >
                    <item.icon className="h-5 w-5" strokeWidth={isActive ? 2.25 : 1.75} />
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className={`flex min-w-[56px] flex-col items-center gap-0.5 rounded-xl px-3 py-2 transition-colors ${
              moreOpen ? 'text-brand-yellow-dark' : 'text-ink-light'
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
                moreOpen ? 'bg-brand-yellow/20' : ''
              }`}
            >
              <MoreHorizontal className="h-5 w-5" strokeWidth={moreOpen ? 2.25 : 1.75} />
            </div>
            <span className={`text-[10px] font-medium ${moreOpen ? 'font-semibold' : ''}`}>More</span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink-black/40 backdrop-blur-sm lg:hidden"
              onClick={closeMore}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl border-t border-gray-100 bg-white shadow-2xl lg:hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-ink-black">More</h2>
                  <p className="text-xs text-ink-muted">Explore all features</p>
                </div>
                <button
                  type="button"
                  onClick={closeMore}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-ink-muted hover:bg-surface-muted"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 px-4 py-4">
                {moreNavItems.map((item, i) => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <NavLink
                      to={item.path}
                      onClick={closeMore}
                      className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-surface-off active:bg-brand-yellow/10"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-off">
                        <item.icon className="h-5 w-5 text-ink-charcoal" strokeWidth={1.75} />
                      </div>
                      <span className="text-center text-[10px] font-medium leading-tight text-ink-charcoal">
                        {item.label}
                      </span>
                    </NavLink>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-4 py-3">
                <button
                  type="button"
                  onClick={closeMore}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-status-danger hover:bg-status-danger-soft"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </div>

              {/* spacer for bottom nav height */}
              <div className="h-16" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
