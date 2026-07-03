import { SkeletonLoader } from './Skeleton'

export default function KPICardSkeleton() {
  return (
    <div className="card-base relative min-h-[180px] overflow-hidden p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50" />
      <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-brand-yellow/8 blur-2xl" />
      <div className="relative h-full min-h-[148px]">
        <SkeletonLoader label="Syncing metric" />
      </div>
    </div>
  )
}
