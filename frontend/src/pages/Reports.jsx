import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

function RoiPill({ roi }) {
  if (roi === null || roi === undefined) return <span className="text-gray-400 text-sm">—</span>
  const positive = roi >= 0
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
      positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    }`}>
      {positive ? '▲' : '▼'} {roi}
    </span>
  )
}

export default function Reports() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/reports/')
      .then((res) => setRows(res.data))
      .catch(() => setError('Could not load reports. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  function downloadCsv() {
    const token = localStorage.getItem('token')
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
    fetch(`${base}/reports/?format=csv`, { headers: { Authorization: `Token ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'transitops_report.csv'
        a.click()
        window.URL.revokeObjectURL(url)
      })
  }

  const totalOperationalCost = rows.reduce((sum, r) => sum + r.operational_cost, 0)
  const totalRevenue = rows.reduce((sum, r) => sum + r.total_revenue, 0)

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            ₹{totalOperationalCost.toFixed(2)} operational cost • ₹{totalRevenue.toFixed(2)} revenue
          </p>
        </div>
        <Button onClick={downloadCsv} variant="secondary">⬇ Export CSV</Button>
      </div>

      {loading && <SkeletonTable rows={4} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && rows.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState icon="📊" title="No report data yet" subtitle="Complete a trip and log fuel to see fuel efficiency, cost, and ROI here." />
        </div>
      )}

      {!loading && !error && rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Vehicle</th>
                <th className="px-5 py-3 font-medium">Distance</th>
                <th className="px-5 py-3 font-medium">Fuel Efficiency</th>
                <th className="px-5 py-3 font-medium">Operational Cost</th>
                <th className="px-5 py-3 font-medium">Revenue</th>
                <th className="px-5 py-3 font-medium">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r) => (
                <tr key={r.vehicle} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-gray-900">{r.vehicle}</p>
                    <p className="text-xs text-gray-400">{r.vehicle_name}</p>
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">{r.total_distance} km</td>
                  <td className="px-5 py-3.5 text-gray-700">{r.fuel_efficiency_km_per_l} km/L</td>
                  <td className="px-5 py-3.5 text-gray-700">₹{r.operational_cost}</td>
                  <td className="px-5 py-3.5 text-gray-700">₹{r.total_revenue}</td>
                  <td className="px-5 py-3.5"><RoiPill roi={r.roi} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">
        ROI = (Revenue − (Maintenance + Fuel)) / Acquisition Cost
      </p>
    </PageContainer>
  )
}
