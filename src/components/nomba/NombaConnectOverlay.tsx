import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNombaConnection } from '../../context/NombaConnectionContext'
import NombaSyncAnimation from './NombaSyncAnimation'

type Step = 'intro' | 'credentials' | 'syncing' | 'done'
const DOCS_URL = 'https://developer.nomba.com/docs/getting-started/get-api-keys'

export default function NombaConnectOverlay({ children }: { children: React.ReactNode }) {
  const {
    hydrated,
    isConnecting,
    isSyncing,
    isConnected,
    error,
    session,
    connectWithCredentials,
    connectToSandbox,
    completeSync,
    clearError,
  } = useNombaConnection()

  const [modalOpen, setModalOpen] = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [step, setStep] = useState<Step>('intro')
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [accountId, setAccountId] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [fieldError, setFieldError] = useState('')

  const isDemo = session?.demoMode ?? true
  const showBanner = hydrated && isConnected && isDemo && !bannerDismissed

  const openModal = () => { setModalOpen(true); setStep('intro') }
  const closeModal = () => { setModalOpen(false); setFieldError(''); clearError() }

  const handleSandboxConnect = async () => {
    clearError()
    const ok = await connectToSandbox()
    if (ok) setStep('syncing')
  }

  const handleCredentialSubmit = async () => {
    if (!clientId.trim() || !clientSecret.trim() || !accountId.trim()) {
      setFieldError('All three fields are required.')
      return
    }
    setFieldError('')
    clearError()
    const ok = await connectWithCredentials({
      clientId: clientId.trim(),
      clientSecret: clientSecret.trim(),
      accountId: accountId.trim(),
    })
    if (ok) setStep('syncing')
  }

  const handleSyncComplete = () => {
    setStep('done')
    completeSync()
    // auto-close after 1.8s
    setTimeout(() => setModalOpen(false), 1800)
  }

  if (!hydrated) return <>{children}</>

  return (
    <div className="relative">
      {/* Dashboard always visible — no blur, no block */}
      {children}

      {/* ── Demo mode banner ─────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-4 top-4 z-[60] mx-auto max-w-lg"
          >
            <div className="flex items-center gap-3 rounded-2xl border border-brand-yellow/30 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-xl">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/15">
                <Zap className="h-4 w-4 text-brand-yellow-dark" fill="currentColor" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-black">Demo mode — sample data</p>
                <p className="text-[11px] text-ink-muted">Connect your Nomba account to see live figures</p>
              </div>
              <button
                onClick={openModal}
                className="shrink-0 rounded-xl bg-brand-yellow px-3 py-1.5 text-xs font-bold text-ink-black transition-all hover:bg-brand-yellow-dark"
              >
                Connect
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                className="shrink-0 text-ink-light hover:text-ink-muted"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Connect modal (optional, non-blocking) ───────────── */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-ink-black/40 backdrop-blur-sm"
              onClick={closeModal}
            />

            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.93, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 28 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed left-4 right-4 top-[8%] z-[71] mx-auto max-w-md rounded-2xl border border-gray-100 bg-white shadow-2xl sm:top-[12%]"
            >
              {/* Close btn */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-ink-light hover:bg-surface-muted"
              >
                <X className="h-4 w-4" />
              </button>

              <AnimatePresence mode="wait">
                {/* Step 1 — Intro */}
                {step === 'intro' && (
                  <motion.div
                    key="intro"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-7 sm:p-8"
                  >
                    <div className="mb-5 flex justify-center">
                      <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15">
                          <Zap className="h-7 w-7 text-brand-yellow-dark" fill="currentColor" />
                        </div>
                        <motion.div
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow"
                          animate={{ scale: [1, 1.18, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Sparkles className="h-3 w-3 text-ink-black" />
                        </motion.div>
                      </div>
                    </div>

                    <h2 className="text-center text-xl font-bold text-ink-black">Connect with Nomba</h2>
                    <p className="mx-auto mt-2 max-w-xs text-center text-sm leading-relaxed text-ink-muted">
                      Replace sample data with real transactions, balance, and sales from Nomba.
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      {[
                        { icon: Zap, label: 'Live sync' },
                        { icon: ShieldCheck, label: 'OAuth2 secure' },
                        { icon: Sparkles, label: 'AI insights' },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl bg-surface-off px-2 py-3">
                          <Icon className="h-4 w-4 text-brand-yellow-dark" />
                          <span className="text-[11px] font-medium text-ink-charcoal">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* PRIMARY — Sandbox (no credentials) */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSandboxConnect}
                      disabled={isConnecting}
                      className="btn-primary mt-6 w-full py-3 text-sm"
                    >
                      {isConnecting ? 'Connecting to sandbox...' : 'Connect to Nomba Sandbox'}
                      <ChevronRight className="h-4 w-4" />
                    </motion.button>
                    <p className="mt-1.5 text-center text-[11px] text-ink-muted">
                      No credentials needed — uses the free Nomba sandbox
                    </p>

                    {/* Divider */}
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span className="text-[11px] text-ink-light">or</span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* SECONDARY — Real credentials */}
                    <button
                      onClick={() => setStep('credentials')}
                      className="w-full rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-ink-charcoal transition-colors hover:bg-surface-muted"
                    >
                      I have API keys (production / private sandbox)
                    </button>
                  </motion.div>
                )}

                {/* Step 2 — Credentials */}
                {step === 'credentials' && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-7 sm:p-8"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <button
                        onClick={() => { setStep('intro'); setFieldError(''); clearError() }}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-ink-muted hover:bg-surface-muted"
                      >
                        ←
                      </button>
                      <div>
                        <h2 className="text-base font-bold text-ink-black">Enter your API keys</h2>
                        <p className="text-xs text-ink-muted">From your Nomba Developer Dashboard</p>
                      </div>
                    </div>

                    <a
                      href={DOCS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mb-5 flex items-center justify-between rounded-xl border border-brand-yellow/25 bg-brand-yellow/8 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-brand-yellow-dark" />
                        <span className="text-xs font-semibold text-ink-charcoal">Where do I find my keys?</span>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-ink-muted" />
                    </a>

                    <div className="space-y-3">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Account ID</label>
                        <input
                          type="text"
                          placeholder="e.g. 890022ce-bae0-45c1..."
                          value={accountId}
                          onChange={(e) => { setAccountId(e.target.value); setFieldError('') }}
                          className="input-base font-mono text-sm"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Client ID</label>
                        <input
                          type="text"
                          placeholder="e.g. 2242b79d-f2cf-4ccc..."
                          value={clientId}
                          onChange={(e) => { setClientId(e.target.value); setFieldError('') }}
                          className="input-base font-mono text-sm"
                          autoComplete="off"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-ink-charcoal">Client Secret</label>
                        <div className="relative">
                          <input
                            type={showSecret ? 'text' : 'password'}
                            placeholder="••••••••••••"
                            value={clientSecret}
                            onChange={(e) => { setClientSecret(e.target.value); setFieldError('') }}
                            className="input-base pr-10 font-mono text-sm"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSecret((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink-muted"
                          >
                            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {fieldError && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-status-danger">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {fieldError}
                      </div>
                    )}
                    {error && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-status-danger/20 bg-status-danger-soft px-4 py-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
                        <div>
                          <p className="text-xs font-semibold text-status-danger">Connection failed</p>
                          <p className="mt-0.5 text-xs text-ink-charcoal">{error}</p>
                          <button onClick={clearError} className="mt-1.5 text-xs font-semibold text-brand-yellow-dark hover:underline">Dismiss</button>
                        </div>
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCredentialSubmit}
                      disabled={isConnecting}
                      className="btn-primary mt-5 w-full py-3 text-sm"
                    >
                      {isConnecting ? 'Authenticating...' : 'Connect & sync data'}
                    </motion.button>
                    <p className="mt-3 text-center text-[11px] text-ink-light">
                      Keys stored in browser session only — never sent to our servers
                    </p>
                  </motion.div>
                )}

                {/* Step 3 — Syncing */}
                {(step === 'syncing' || (isSyncing && step === 'syncing')) && (
                  <motion.div
                    key="syncing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-7 sm:p-8"
                  >
                    <NombaSyncAnimation onAuthenticate={async () => true} onComplete={handleSyncComplete} />
                  </motion.div>
                )}

                {/* Step 4 — Done */}
                {step === 'done' && (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
                      className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-status-success-soft"
                    >
                      <CheckCircle2 className="h-8 w-8 text-status-success" strokeWidth={2.5} />
                    </motion.div>
                    <h2 className="text-xl font-bold text-ink-black">You're connected!</h2>
                    <p className="mx-auto mt-2 max-w-xs text-sm text-ink-muted">
                      {session?.clientId === 'sandbox'
                        ? 'Nomba sandbox is live. Real test data is now flowing into your dashboard.'
                        : 'Your Nomba account is synced. Dashboard is now showing live data.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
