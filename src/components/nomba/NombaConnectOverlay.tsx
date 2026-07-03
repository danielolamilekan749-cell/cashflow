import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, ExternalLink, Link2, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useState } from 'react'
import { useNombaConnection } from '../../context/NombaConnectionContext'

type NombaConnectOverlayProps = {
  children: React.ReactNode
}

const NOMBA_DOCS_URL = 'https://developer.nomba.com/docs/getting-started/get-api-keys'

export default function NombaConnectOverlay({ children }: NombaConnectOverlayProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const {
    hydrated,
    isLocked,
    error,
    credentialsConfigured,
    startSync,
    authenticate,
    clearError,
  } = useNombaConnection()

  const handleConnect = async () => {
    if (isAuthenticating) {
      return
    }

    setIsAuthenticating(true)
    startSync()
    await authenticate()
    setIsAuthenticating(false)
  }

  if (!hydrated) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <motion.div
        animate={{
          filter: isLocked ? 'blur(8px)' : 'blur(0px)',
          opacity: isLocked ? 0.55 : 1,
          scale: isLocked ? 0.985 : 1,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={isLocked ? 'pointer-events-none select-none' : ''}
        aria-hidden={isLocked}
      >
        {children}
      </motion.div>

      <AnimatePresence>
        {isLocked && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] bg-ink-black/30 backdrop-blur-[2px]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed left-4 right-4 top-[10%] z-[71] mx-auto max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl sm:top-[16%] sm:p-8"
            >
              <div className="mb-5 flex justify-center">
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow/15">
                    <Link2 className="h-7 w-7 text-brand-yellow-dark" />
                  </div>
                  <motion.div
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-yellow"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-3 w-3 text-ink-black" />
                  </motion.div>
                </div>
              </div>

              <div className="mb-4 flex justify-center">
                <span className="rounded-full bg-surface-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                  Nomba Sandbox
                </span>
              </div>

              <h2 className="text-center text-xl font-bold text-ink-black">
                Connect with Nomba
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-center text-sm leading-relaxed text-ink-muted">
                Authenticate with your sandbox API keys to sync transactions, sales, and customer
                data into CashFlow AI.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  { icon: Zap, label: 'Real-time sync' },
                  { icon: ShieldCheck, label: 'OAuth2 secure' },
                  { icon: Sparkles, label: 'AI insights' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-xl bg-surface-off px-3 py-2.5 sm:flex-col sm:gap-1 sm:text-center"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-brand-yellow-dark" />
                    <span className="text-xs font-medium text-ink-charcoal">{label}</span>
                  </div>
                ))}
              </div>

              {!credentialsConfigured && (
                <div className="mt-4 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 px-4 py-3">
                  <p className="text-xs leading-relaxed text-ink-charcoal">
                    Add your sandbox keys to <code className="rounded bg-white/60 px-1">.env</code>{' '}
                    (see <code className="rounded bg-white/60 px-1">.env.example</code>). Demo mode
                    will run until keys are configured.
                  </p>
                  <a
                    href={NOMBA_DOCS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-brand-yellow-dark hover:underline"
                  >
                    Nomba API docs
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-status-danger/20 bg-status-danger-soft px-4 py-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger" />
                  <div>
                    <p className="text-xs font-semibold text-status-danger">Connection failed</p>
                    <p className="mt-0.5 text-xs text-ink-charcoal">{error}</p>
                    <button
                      type="button"
                      onClick={clearError}
                      className="mt-2 text-xs font-semibold text-brand-yellow-dark hover:underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              <motion.button
                type="button"
                onClick={handleConnect}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isAuthenticating}
                className="btn-primary mt-6 w-full py-3 text-sm"
              >
                {isAuthenticating ? 'Connecting...' : 'Connect with Nomba'}
              </motion.button>

              <p className="mt-4 text-center text-[11px] text-ink-light">
                Uses{' '}
                <a
                  href="https://developer.nomba.com/docs/getting-started/authentication"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink-muted hover:text-ink-charcoal"
                >
                  client credentials
                </a>{' '}
                · Sandbox only during hackathon
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
