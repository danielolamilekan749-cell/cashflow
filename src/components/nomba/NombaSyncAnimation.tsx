import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

type SyncStep = {
  label: string
  progress: number
}

const SYNC_STEPS: SyncStep[] = [
  { label: 'Authenticating with Nomba sandbox...', progress: 10 },
  { label: 'Fetching transactions...', progress: 28 },
  { label: 'Syncing sales data...', progress: 48 },
  { label: 'Importing customers...', progress: 65 },
  { label: 'Analyzing insights...', progress: 82 },
  { label: 'Preparing your dashboard...', progress: 94 },
  { label: 'All set!', progress: 100 },
]

type NombaSyncAnimationProps = {
  onAuthenticate: () => Promise<boolean>
  onComplete: () => void
}

export default function NombaSyncAnimation({ onAuthenticate, onComplete }: NombaSyncAnimationProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [authReady, setAuthReady] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const currentStep = SYNC_STEPS[stepIndex]
  const isComplete = progress >= 100

  useEffect(() => {
    let cancelled = false
    onAuthenticate().then((success) => {
      if (!cancelled && success) setAuthReady(true)
    })
    return () => { cancelled = true }
  }, [onAuthenticate])

  useEffect(() => {
    if (!authReady) return
    if (isComplete) {
      setShowSuccess(true)
      const timer = setTimeout(() => onComplete(), 1600)
      return () => clearTimeout(timer)
    }
    const targetProgress = SYNC_STEPS[stepIndex]?.progress ?? 100
    const interval = setInterval(() => {
      setProgress((prev) => Math.min(targetProgress, prev + 1.2))
    }, 40)
    return () => clearInterval(interval)
  }, [authReady, stepIndex, isComplete, onComplete])

  useEffect(() => {
    if (!authReady) return
    if (progress >= (SYNC_STEPS[stepIndex]?.progress ?? 100) && stepIndex < SYNC_STEPS.length - 1) {
      const timer = setTimeout(() => setStepIndex((i) => i + 1), 400)
      return () => clearTimeout(timer)
    }
  }, [authReady, progress, stepIndex])

  return (
    <div className="flex flex-col items-center px-2 py-6">
      {/* Icon area */}
      <div className="relative mb-8 flex items-center justify-center">
        {/* Glow ring */}
        <motion.div
          className="absolute h-28 w-28 rounded-full bg-brand-yellow/20"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0.25, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute h-20 w-20 rounded-full bg-brand-yellow/30"
          animate={{ scale: [1, 1.12, 1], opacity: [0.8, 0.4, 0.8] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Icon container */}
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 20 }}
              className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-status-success shadow-lg"
            >
              <CheckCircle2 className="h-8 w-8 text-white" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-yellow shadow-lg shadow-brand-yellow/30"
            >
              {/* Spinning border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-[3px] border-transparent border-t-white/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
              />
              <Zap className="h-7 w-7 text-ink-black" fill="currentColor" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Title */}
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="done-title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 text-center text-xl font-bold text-ink-black"
          >
            You're all set!
          </motion.div>
        ) : (
          <motion.div
            key="syncing-title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-1 text-center text-xl font-bold text-ink-black"
          >
            Syncing your data
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mb-8 text-center text-sm text-ink-muted">
        {showSuccess ? 'Redirecting to your dashboard...' : 'This takes just a moment'}
      </p>

      {/* Progress */}
      <div className="w-full max-w-xs">
        {/* Step label */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentStep.label}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.22 }}
              className="truncate text-[13px] font-medium text-ink-charcoal"
            >
              {currentStep.label}
            </motion.p>
          </AnimatePresence>
          <span className="shrink-0 text-[13px] font-bold tabular-nums text-brand-yellow-dark">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-brand-yellow via-amber-400 to-brand-yellow-dark"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Step dots */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {SYNC_STEPS.slice(0, -1).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === stepIndex ? 16 : 6,
                backgroundColor: i <= stepIndex ? '#F5C84C' : '#E5E7EB',
              }}
              style={{ height: 6 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {!authReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-2.5"
        >
          <motion.span
            className="h-2 w-2 rounded-full bg-brand-yellow"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-xs font-medium text-ink-muted">Verifying sandbox credentials...</span>
        </motion.div>
      )}
    </div>
  )
}
