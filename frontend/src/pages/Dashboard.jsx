import { useEffect, useState } from 'react'
import client from '../api/client'

function KpiCard({ label, value, suffix = '' }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}{suffix}</p>
    </div>
  )
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/dashboard/')
      .then((res) => setKpis(res.data))
      .catch(() => setError('Could not load dashboard. Is the backend running?'))
  }, [])

  if (error) return <p className="text-red-600 max-w-4xl mx-auto mt-10 px-4">{error}</p>
  if (!kpis) return <p className="text-gray-500 max-w-4xl mx-auto mt-10 px-4">Loading dashboard...</p>

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fleet Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Active Vehicles" value={kpis.active_vehicles} />
        <KpiCard label="Available Vehicles" value={kpis.available_vehicles} />
        <KpiCard label="In Maintenance" value={kpis.vehicles_in_maintenance} />
        <KpiCard label="Active Trips" value={kpis.active_trips} />
        <KpiCard label="Pending Trips" value={kpis.pending_trips} />
        <KpiCard label="Drivers On Duty" value={kpis.drivers_on_duty} />
        <KpiCard label="Fleet Utilization" value={kpis.fleet_utilization_percent} suffix="%" />
      </div>
    </div>
  )
}
