export default function EmptyState({ icon = '📋', title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-gray-900 font-medium mb-1">{title}</p>
      {subtitle && <p className="text-gray-500 text-sm mb-5 max-w-sm">{subtitle}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 rounded-lg font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
