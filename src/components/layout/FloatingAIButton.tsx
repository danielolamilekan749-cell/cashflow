import { Bot, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function FloatingAIButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-3 text-sm font-bold text-ink-black shadow-float animate-pulse-soft lg:bottom-8 lg:right-8"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Ask CashFlow AI"
      >
        <Bot className="h-5 w-5" />
        <span className="hidden sm:inline">Ask CashFlow AI</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-ink-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md rounded-card-lg border border-gray-100 bg-white p-5 shadow-2xl lg:bottom-8 lg:right-8 lg:left-auto"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-yellow">
                    <Bot className="h-4 w-4 text-ink-black" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink-black">CashFlow AI</p>
                    <p className="text-xs text-ink-muted">Quick ask</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mb-4 text-sm text-ink-muted">
                Ask me anything about your business — sales, customers, debts, or growth.
              </p>

              <div className="space-y-2">
                {[
                  'What sold most this week?',
                  'Why are sales down?',
                  'Who spends the most?',
                ].map((q) => (
                  <Link
                    key={q}
                    to="/ai-assistant"
                    onClick={() => setOpen(false)}
                    className="block w-full rounded-xl border border-gray-100 bg-surface-off px-4 py-2.5 text-left text-sm font-medium text-ink-charcoal transition-colors hover:border-brand-yellow/40 hover:bg-brand-yellow/5"
                  >
                    {q}
                  </Link>
                ))}
              </div>

              <Link
                to="/ai-assistant"
                onClick={() => setOpen(false)}
                className="btn-primary mt-4 w-full"
              >
                Open AI Assistant
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
