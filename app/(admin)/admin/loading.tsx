// app/(admin)/admin/loading.tsx

import { SkeletonCard } from "@/components/shared/SkeletonCard";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 bg-slate-700 rounded w-48 animate-pulse" />
        <div className="h-4 bg-slate-800 rounded w-64 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
      </div>
    </div>
  );
}