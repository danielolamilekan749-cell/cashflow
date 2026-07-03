import {
  BarChart3,
  Bell,
  Bot,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Settings,
  Users,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { NavItem } from '../../types'

export const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { id: 'ai', label: 'AI Assistant', path: '/ai-assistant', icon: Bot },
  { id: 'insights', label: 'Business Insights', path: '/insights', icon: Lightbulb },
  { id: 'products', label: 'Products', path: '/products', icon: Package },
  { id: 'customers', label: 'Customers', path: '/customers', icon: Users },
  { id: 'debts', label: 'Debt Tracker', path: '/debts', icon: CreditCard },
  { id: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', path: '/settings', icon: Settings },
]

// Group labels for visual separation
const navGroups = [
  {
    label: 'Overview',
    ids: ['dashboard', 'ai', 'insights'],
  },
  {
    label: 'Manage',
    ids: ['products', 'customers', 'debts'],
  },
  {
    label: 'More',
    ids: ['notifications', 'reports', 'settings'],
  },
]

export default function Sidebar() {
  const handleLogout = () => {
    window.location.href = '/'
  }

  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-gray-100/80 lg:bg-white lg:overflow-hidden">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-gray-100/80 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow shadow-sm">
            <Zap className="h-4.5 w-4.5 text-ink-black" fill="currentColor" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold tracking-tight text-ink-black">CashFlow AI</h1>
            <p className="text-[10px] font-medium text-ink-light">Powered by Nomba</p>
          </div>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navGroups.map((group) => {
            const items = navItems.filter((n) => group.ids.includes(n.id))
            return (
              <div key={group.label}>
                <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-ink-light">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.path === '/'}
                      className={({ isActive }) =>
                        `nav-item !py-2.5 !text-[13px] ${isActive ? 'nav-item-active' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className="h-4 w-4 shrink-0"
                            strokeWidth={isActive ? 2.25 : 1.75}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-100/80 px-3 py-4">
          <button
            onClick={handleLogout}
            className="nav-item w-full !text-[13px] text-status-danger hover:!bg-status-danger-soft hover:!text-status-danger"
          >
            <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
