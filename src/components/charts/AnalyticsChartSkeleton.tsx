import { SkeletonLoader } from '../ui/Skeleton'

export default function AnalyticsChartSkeleton() {
  return (
    <div className="relative min-h-[280px] overflow-hidden rounded-xl bg-gradient-to-br from-white via-white to-slate-50">
      <div className="pointer-events-none absolute right-6 top-4 h-24 w-24 rounded-full bg-brand-yellow/6 blur-3xl" />
      <div className="h-full min-h-[280px]">
        <SkeletonLoader label="Syncing analytics" />
      </div>
    </div>
  )
}
