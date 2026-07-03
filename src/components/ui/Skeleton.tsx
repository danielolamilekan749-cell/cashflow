import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
}

export function SkeletonLoader({ label = 'Syncing data' }: { label?: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="inline-flex items-center gap-2.5 rounded-full border border-gray-200/80 bg-white/98 px-4 py-2 shadow-lg shadow-brand-yellow/10 backdrop-blur-xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="h-4 w-4 text-brand-yellow-dark" strokeWidth={2.5} />
        </motion.div>
        <span className="text-[11px] font-semibold text-ink-charcoal">{label}</span>
      </motion.div>
    </div>
  )
}
