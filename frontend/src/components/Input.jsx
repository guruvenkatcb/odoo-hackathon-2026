export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        className={`w-full px-3 py-2 border rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-colors ${
          error ? 'border-red-400 bg-red-50/30' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">⚠ {error}</p>}
    </div>
  )
}
