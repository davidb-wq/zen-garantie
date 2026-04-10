export default function Loading() {
  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-6 w-36 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        </div>
        <div className="h-9 w-24 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
