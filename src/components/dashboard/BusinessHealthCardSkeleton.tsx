import { SkeletonLoader } from '../ui/Skeleton'

export default function BusinessHealthCardSkeleton() {
  return (
    <div className="card-base relative min-h-[220px] overflow-hidden p-4 lg:min-h-[240px] lg:p-6">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-yellow/8 blur-3xl" />
      <div className="relative h-full min-h-[188px] lg:min-h-[192px]">
        <SkeletonLoader label="Syncing health score" />
      </div>
    </div>
  )
}
