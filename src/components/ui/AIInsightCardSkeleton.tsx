import { SkeletonLoader } from './Skeleton'

export default function AIInsightCardSkeleton() {
  return (
    <div className="card-base relative min-h-[150px] overflow-hidden border p-5">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
      <div className="pointer-events-none absolute left-0 top-0 h-20 w-20 rounded-full bg-brand-yellow/6 blur-2xl" />
      <div className="relative h-full min-h-[108px]">
        <SkeletonLoader label="Syncing insight" />
      </div>
    </div>
  )
}
