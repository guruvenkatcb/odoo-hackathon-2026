import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import PageContainer from '../components/PageContainer'
import Button from '../components/Button'
import { SkeletonCard } from '../components/Skeleton'
import Badge from '../components/Badge'

function KpiCard({ label, value, suffix = '', hint }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}{suffix}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function StatusBar({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [trips, setTrips] = useState([])
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      client.get('/dashboard/'),
      client.get('/vehicles/'),
      client.get('/trips/'),
    ])
      .then(([kpiRes, vehRes, tripRes]) => {
        setKpis(kpiRes.data)
        setVehicles(vehRes.data)
        setTrips(tripRes.data.slice(0, 6))
      })
      .catch(() => setError('Could not load dashboard. Is the backend running?'))
  }, [])

  if (error) {
    return (
      <PageContainer>
        <p className="text-red-600">{error}</p>
      </PageContainer>
    )
  }

  if (!kpis) {
    return (
      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </PageContainer>
    )
  }

  const statusCounts = vehicles.reduce((acc, v) => {
    acc[v.status] = (acc[v.status] || 0) + 1
    return acc
  }, {})
  const totalVehicles = vehicles.length

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fleet Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Live operational overview</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Active Vehicles" value={kpis.active_vehicles} hint={`${kpis.available_vehicles} available`} />
        <KpiCard label="Active Trips" value={kpis.active_trips} hint={`${kpis.pending_trips} pending`} />
        <KpiCard label="In Maintenance" value={kpis.vehicles_in_maintenance} hint="vehicles in shop" />
        <KpiCard label="Fleet Utilization" value={kpis.fleet_utilization_percent} suffix="%" hint={`${kpis.drivers_on_duty} drivers on duty`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vehicle status breakdown */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Vehicle Status Breakdown</h3>
          <StatusBar label="Available" value={statusCounts['Available'] || 0} total={totalVehicles} color="bg-green-500" />
          <StatusBar label="On Trip" value={statusCounts['On Trip'] || 0} total={totalVehicles} color="bg-blue-500" />
          <StatusBar label="In Shop" value={statusCounts['In Shop'] || 0} total={totalVehicles} color="bg-orange-500" />
          <StatusBar label="Retired" value={statusCounts['Retired'] || 0} total={totalVehicles} color="bg-red-400" />
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => navigate('/vehicles')}>+ Vehicle</Button>
            <Button variant="secondary" onClick={() => navigate('/drivers')}>+ Driver</Button>
            <Button variant="secondary" onClick={() => navigate('/trips')}>⚡ Dispatch</Button>
            <Button variant="secondary" onClick={() => navigate('/fuel-expenses')}>⛽ Expense</Button>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Trips</h3>
          {trips.length === 0 && <p className="text-sm text-gray-400">No trips yet — create one to see activity here.</p>}
          <div className="space-y-3">
            {trips.map((t) => (
              <div key={t.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-900 font-medium">{t.source} → {t.destination}</p>
                  <p className="text-gray-400 text-xs">{new Date(t.created_at).toLocaleString()}</p>
                </div>
                <Badge status={t.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
