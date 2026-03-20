// app/(dashboard)/dashboard/loading.tsx

import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 bg-slate-700 rounded w-32 animate-pulse" />
          <div className="h-4 bg-slate-800 rounded w-48 animate-pulse" />
        </div>
        <div className="h-10 bg-slate-700 rounded-xl w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}