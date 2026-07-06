import {
  BarChart3,
  Bell,
  Bot,
  CreditCard,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  MessageCircle,
  Package,
  Settings,
  Users,
  Zap,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useState } from 'react'
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
        <div className="border-t border-gray-100/80 px-3 py-4 space-y-2">
          {/* WhatsApp connect widget */}
          <WhatsAppWidget />

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

// ─── WhatsApp sidebar widget ──────────────────────────────────────────────────

function WhatsAppWidget() {
  const [connected, setConnected] = useState(() => {
    return localStorage.getItem('whatsapp_connected') === 'true'
  })
  const [phone, setPhone] = useState(() => localStorage.getItem('whatsapp_phone') ?? '')
  const [expanded, setExpanded] = useState(false)
  const [inputPhone, setInputPhone] = useState('')
  const [step, setStep] = useState<'enter' | 'verify'>('enter')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    if (!inputPhone.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('verify')
    }, 1200)
  }

  const handleVerify = () => {
    if (otp.length < 4) return
    setLoading(true)
    setTimeout(() => {
      const fullPhone = `+234 ${inputPhone.trim()}`
      setConnected(true)
      setPhone(fullPhone)
      localStorage.setItem('whatsapp_connected', 'true')
      localStorage.setItem('whatsapp_phone', fullPhone)
      setLoading(false)
      setExpanded(false)
      setStep('enter')
      setInputPhone('')
      setOtp('')
    }, 1000)
  }

  const handleDisconnect = () => {
    setConnected(false)
    setPhone('')
    localStorage.removeItem('whatsapp_connected')
    localStorage.removeItem('whatsapp_phone')
  }

  if (connected) {
    return (
      <div className="rounded-xl bg-[#25D366]/8 border border-[#25D366]/20 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-ink-black truncate">WhatsApp alerts on</p>
            <p className="text-[10px] text-ink-muted truncate">{phone}</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="shrink-0 text-[10px] font-semibold text-status-danger hover:underline"
          >
            Off
          </button>
        </div>
      </div>
    )
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-[#25D366]/25 bg-[#25D366]/8 px-3 py-2.5 transition-colors hover:bg-[#25D366]/15"
      >
        <MessageCircle className="h-4 w-4 shrink-0 text-[#25D366]" />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[11px] font-semibold text-ink-black">Connect WhatsApp</p>
          <p className="text-[10px] text-ink-muted">Get alerts on your phone</p>
        </div>
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-[#25D366]/25 bg-[#25D366]/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
          <p className="text-[11px] font-bold text-ink-black">WhatsApp</p>
        </div>
        <button onClick={() => { setExpanded(false); setStep('enter') }} className="text-[10px] text-ink-muted hover:text-ink-charcoal">✕</button>
      </div>

      {step === 'enter' ? (
        <>
          <div className="flex gap-1.5">
            <span className="flex items-center rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-semibold text-ink-charcoal">+234</span>
            <input
              type="tel"
              placeholder="801 234 5678"
              value={inputPhone}
              onChange={(e) => setInputPhone(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[11px] text-ink-black focus:border-[#25D366] focus:outline-none"
            />
          </div>
          <button
            onClick={handleConnect}
            disabled={loading || !inputPhone.trim()}
            className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: '#25D366' }}
          >
            {loading ? 'Sending...' : 'Send code'}
          </button>
        </>
      ) : (
        <>
          <input
            type="number"
            placeholder="Enter 4-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.slice(0, 4))}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-center text-[13px] font-bold tracking-widest text-ink-black focus:border-[#25D366] focus:outline-none"
          />
          <button
            onClick={handleVerify}
            disabled={loading || otp.length < 4}
            className="mt-2 w-full rounded-lg py-1.5 text-[11px] font-bold text-white disabled:opacity-50"
            style={{ backgroundColor: '#25D366' }}
          >
            {loading ? 'Verifying...' : 'Verify & connect'}
          </button>
          <button onClick={() => setStep('enter')} className="mt-1 w-full text-center text-[10px] text-ink-muted hover:text-ink-charcoal">Change number</button>
        </>
      )}
    </div>
  )
}
