const PALETTES = {
  // Vehicles
  Available: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  'On Trip': 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  'In Shop': 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
  Retired: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  // Drivers
  'Off Duty': 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20',
  Suspended: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  // Trips
  Draft: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20',
  Dispatched: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20',
  Completed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
  Cancelled: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20',
  // Maintenance
  Open: 'bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20',
  Closed: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
}

const DOTS = {
  Available: 'bg-green-500', 'On Trip': 'bg-blue-500', 'In Shop': 'bg-orange-500',
  Retired: 'bg-red-500', 'Off Duty': 'bg-gray-400', Suspended: 'bg-red-500',
  Draft: 'bg-gray-400', Dispatched: 'bg-blue-500', Completed: 'bg-green-500',
  Cancelled: 'bg-red-500', Open: 'bg-orange-500', Closed: 'bg-green-500',
}

export default function Badge({ status }) {
  const palette = PALETTES[status] || 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-500/20'
  const dot = DOTS[status] || 'bg-gray-400'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${palette}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  )
}
