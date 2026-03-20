// components/shared/SkeletonCard.tsx

export function SkeletonCard() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-slate-700 rounded w-1/2" />
        <div className="w-10 h-10 bg-slate-700 rounded-xl" />
      </div>
      <div className="h-8 bg-slate-700 rounded w-1/3 mb-2" />
      <div className="h-3 bg-slate-800 rounded w-1/4" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 animate-pulse flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-700 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-slate-700 rounded w-1/3" />
        <div className="h-3 bg-slate-800 rounded w-1/4" />
      </div>
      <div className="h-6 bg-slate-700 rounded-full w-16" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2 animate-pulse">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-4 bg-slate-700 rounded"
          style={{ width: `${100 - i * 10}%` }}
        />
      ))}
    </div>
  );
}