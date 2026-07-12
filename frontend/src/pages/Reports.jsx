import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'

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

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <Button onClick={downloadCsv} variant="secondary">Export CSV</Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">Fuel (L)</th>
                <th className="px-4 py-3">Efficiency (km/L)</th>
                <th className="px-4 py-3">Operational Cost</th>
                <th className="px-4 py-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.vehicle} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{r.vehicle} — {r.vehicle_name}</td>
                  <td className="px-4 py-3">{r.total_distance} km</td>
                  <td className="px-4 py-3">{r.total_fuel_liters} L</td>
                  <td className="px-4 py-3">{r.fuel_efficiency_km_per_l}</td>
                  <td className="px-4 py-3">₹{r.operational_cost}</td>
                  <td className="px-4 py-3">{r.roi !== null ? r.roi : '—'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-6 text-center text-gray-400">No data yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
