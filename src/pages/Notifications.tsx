import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  Bot,
  Check,
  ChevronRight,
  MessageCircle,
  Package,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { notifications } from '../data/mockData'

const typeIcons = {
  payment: Wallet,
  growth: TrendingUp,
  inventory: Package,
  ai: Bot,
  customer: Users,
}

const typeColors = {
  payment: 'bg-status-success-soft text-status-success',
  growth: 'bg-brand-yellow/15 text-brand-yellow-dark',
  inventory: 'bg-status-warning-soft text-status-warning',
  ai: 'bg-purple-50 text-purple-600',
  customer: 'bg-blue-50 text-blue-600',
}

type NotifToggle = {
  id: string
  label: string
  description: string
  enabled: boolean
}

const defaultToggles: NotifToggle[] = [
  { id: 'payments', label: 'Payment alerts', description: 'New payments & debt collections', enabled: true },
  { id: 'inventory', label: 'Low inventory', description: 'When stock falls below threshold', enabled: true },
  { id: 'insights', label: 'AI insights', description: 'Smart tips & business analysis', enabled: true },
  { id: 'customers', label: 'Customer activity', description: 'New & returning customer alerts', enabled: false },
  { id: 'debts', label: 'Debt reminders', description: 'Overdue & upcoming debt dues', enabled: true },
]

type ModalStep = 'enter' | 'verify' | 'done'

function WhatsAppModal({ onClose }: { onClose: (connected: boolean, phone?: string) => void }) {
  const [step, setStep] = useState<ModalStep>('enter')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = () => {
    if (phone.replace(/\D/g, '').length < 10) {
      setError('Enter a valid WhatsApp number')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('verify')
    }, 1400)
  }

  const handleVerify = () => {
    if (otp.length < 4) {
      setError('Enter the 4-digit code sent to your WhatsApp')
      return
    }
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep('done')
    }, 1200)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-ink-black/40 backdrop-blur-sm"
        onClick={() => onClose(false)}
      />
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="fixed left-4 right-4 top-[12%] z-[71] mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl sm:top-[18%] sm:p-8"
      >
        <button
          onClick={() => onClose(false)}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-ink-light hover:bg-surface-muted"
        >
          <X className="h-4 w-4" />
        </button>

        <AnimatePresence mode="wait">
          {step === 'enter' && (
            <motion.div key="enter" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366]/10">
                  <MessageCircle className="h-7 w-7 text-[#25D366]" />
                </div>
              </div>
              <h2 className="text-center text-xl font-bold text-ink-black">Connect WhatsApp</h2>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm text-ink-muted">
                Get real-time business alerts on WhatsApp — even when you're away from the dashboard.
              </p>
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">WhatsApp number</label>
                <div className="flex gap-2">
                  <span className="flex items-center rounded-xl border border-gray-200 bg-surface-off px-3 text-sm font-semibold text-ink-charcoal">+234</span>
                  <input
                    type="tel"
                    placeholder="801 234 5678"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError('') }}
                    className="input-base flex-1"
                    maxLength={14}
                  />
                </div>
                {error && <p className="mt-1.5 text-xs text-status-danger">{error}</p>}
              </div>
              <button
                onClick={handleSendCode}
                disabled={loading}
                className="btn-primary mt-5 w-full py-3 text-sm"
                style={{ backgroundColor: loading ? undefined : '#25D366', color: '#fff' }}
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>
              <p className="mt-3 text-center text-[11px] text-ink-light">
                A 4-digit code will be sent to your WhatsApp
              </p>
            </motion.div>
          )}

          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <div className="mb-5 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366]/10">
                  <MessageCircle className="h-7 w-7 text-[#25D366]" />
                </div>
              </div>
              <h2 className="text-center text-xl font-bold text-ink-black">Enter the code</h2>
              <p className="mx-auto mt-2 max-w-xs text-center text-sm text-ink-muted">
                We sent a 4-digit code to <span className="font-semibold text-ink-black">+234 {phone}</span> on WhatsApp
              </p>
              <div className="mt-6">
                <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Verification code</label>
                <input
                  type="number"
                  placeholder="- - - -"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.slice(0, 4)); setError('') }}
                  className="input-base text-center text-2xl font-bold tracking-[0.4em]"
                />
                {error && <p className="mt-1.5 text-xs text-status-danger">{error}</p>}
              </div>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="btn-primary mt-5 w-full py-3 text-sm"
                style={{ backgroundColor: loading ? undefined : '#25D366', color: '#fff' }}
              >
                {loading ? 'Verifying...' : 'Verify & connect'}
              </button>
              <button onClick={() => setStep('enter')} className="mt-3 w-full text-center text-xs font-medium text-ink-muted hover:text-ink-charcoal">
                Change number
              </button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366]/10"
              >
                <Check className="h-8 w-8 text-[#25D366]" strokeWidth={2.5} />
              </motion.div>
              <h2 className="text-xl font-bold text-ink-black">WhatsApp connected!</h2>
              <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">
                You'll now receive business alerts on <span className="font-semibold text-ink-black">+234 {phone}</span>
              </p>
              <button
                onClick={() => onClose(true, `+234 ${phone}`)}
                className="mt-6 w-full rounded-xl py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: '#25D366' }}
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  )
}

export default function NotificationsPage() {
  const [whatsappConnected, setWhatsappConnected] = useState(false)
  const [whatsappPhone, setWhatsappPhone] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notifToggles, setNotifToggles] = useState(defaultToggles)

  const unread = notifications.filter((n) => !n.read).length

  const handleModalClose = (connected: boolean, phone?: string) => {
    setShowModal(false)
    if (connected && phone) {
      setWhatsappConnected(true)
      setWhatsappPhone(phone)
    }
  }

  const handleDisconnect = () => {
    setWhatsappConnected(false)
    setWhatsappPhone('')
  }

  const toggleNotif = (id: string) => {
    setNotifToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-black">Notifications</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {unread} unread notification{unread !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-secondary text-xs">Mark all read</button>
      </div>

      {/* WhatsApp Connect Card */}
      <div className={`card-base overflow-hidden border-0 ${whatsappConnected ? 'bg-[#25D366]/5 ring-1 ring-[#25D366]/20' : 'bg-gradient-to-br from-[#25D366]/8 via-white to-white ring-1 ring-[#25D366]/15'}`}>
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10">
              <MessageCircle className="h-6 w-6 text-[#25D366]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-ink-black">WhatsApp Notifications</h2>
                {whatsappConnected && (
                  <span className="rounded-full bg-[#25D366]/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#128C7E]">
                    Connected
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-ink-muted">
                {whatsappConnected
                  ? `Alerts are being sent to ${whatsappPhone}`
                  : "Get sales, debt, and inventory alerts directly on WhatsApp — even when you're offline."}
              </p>

              {whatsappConnected ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setShowSettings((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-[#25D366]/30 bg-[#25D366]/10 px-3 py-1.5 text-xs font-semibold text-[#128C7E] transition-colors hover:bg-[#25D366]/20"
                  >
                    Manage alerts
                    <ChevronRight className={`h-3.5 w-3.5 transition-transform ${showSettings ? 'rotate-90' : ''}`} />
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-status-danger hover:bg-status-danger-soft transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Connect WhatsApp
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification type toggles (expanded when connected) */}
        <AnimatePresence>
          {whatsappConnected && showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#25D366]/15 px-5 pb-5 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-light">
                  Alert types
                </p>
                <div className="space-y-2">
                  {notifToggles.map((toggle) => (
                    <div
                      key={toggle.id}
                      className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm"
                    >
                      <div>
                        <p className="text-sm font-semibold text-ink-black">{toggle.label}</p>
                        <p className="text-xs text-ink-muted">{toggle.description}</p>
                      </div>
                      <button
                        onClick={() => toggleNotif(toggle.id)}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                          toggle.enabled ? 'bg-[#25D366]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                            toggle.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.map((notif, i) => {
          const Icon = typeIcons[notif.type]
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`card-base flex items-start gap-4 p-4 transition-all hover:shadow-card-hover ${
                !notif.read ? 'border-brand-yellow/20 bg-brand-yellow/[0.03]' : ''
              }`}
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeColors[notif.type]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink-black">{notif.title}</h3>
                  {!notif.read && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-brand-yellow" />
                  )}
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">{notif.message}</p>
                <p className="mt-1.5 text-xs text-ink-light">{notif.time}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {notifications.length === 0 && (
        <div className="flex flex-col items-center py-16 text-center">
          <Bell className="mb-3 h-12 w-12 text-ink-light" />
          <p className="font-semibold text-ink-charcoal">No notifications yet</p>
          <p className="mt-1 text-sm text-ink-muted">We'll notify you when something important happens.</p>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && <WhatsAppModal onClose={handleModalClose} />}
      </AnimatePresence>
    </motion.div>
  )
}
