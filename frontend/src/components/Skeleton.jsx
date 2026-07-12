export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center gap-4 px-5 py-4">
      <div className="h-4 bg-gray-200 rounded w-1/6" />
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-4 bg-gray-200 rounded w-1/6" />
      <div className="h-4 bg-gray-200 rounded w-1/6 ml-auto" />
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white border border-gray-200 rounded-xl p-5">
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-7 bg-gray-200 rounded w-1/3" />
    </div>
  )
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  )
}
