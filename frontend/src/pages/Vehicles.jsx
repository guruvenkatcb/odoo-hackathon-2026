import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  'On Trip': 'bg-blue-100 text-blue-700',
  'In Shop': 'bg-amber-100 text-amber-700',
  Retired: 'bg-gray-200 text-gray-600',
}

const EMPTY_FORM = { registration_number: '', name: '', type: '', capacity_kg: '', acquisition_cost: '', region: '' }

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  async function fetchVehicles() {
    setLoading(true)
    try {
      const params = statusFilter ? { status: statusFilter } : {}
      const res = await client.get('/vehicles/', { params })
      setVehicles(res.data)
      setError('')
    } catch (err) {
      setError('Could not load vehicles. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicles() }, [statusFilter])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.registration_number.trim() || !form.name.trim() || !form.capacity_kg) {
      setFormError('Registration number, name, and capacity are required.')
      return
    }
    try {
      await client.post('/vehicles/', form)
      setForm(EMPTY_FORM)
      setFormError('')
      setModalOpen(false)
      fetchVehicles()
    } catch (err) {
      const data = err.response?.data
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not create vehicle.'
      setFormError(msg)
    }
  }

  async function handleRetire(id) {
    await client.patch(`/vehicles/${id}/`, { status: 'Retired' })
    fetchVehicles()
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vehicle Registry</h1>
        <Button onClick={() => setModalOpen(true)}>+ Register Vehicle</Button>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'Available', 'On Trip', 'In Shop', 'Retired'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-full border ${
              statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Reg. No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Odometer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{v.registration_number}</td>
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.type}</td>
                  <td className="px-4 py-3">{v.capacity_kg} kg</td>
                  <td className="px-4 py-3">{v.odometer} km</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[v.status]}`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.status !== 'Retired' && (
                      <button onClick={() => handleRetire(v.id)} className="text-xs text-red-600 hover:underline">
                        Retire
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No vehicles found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Vehicle">
        <form onSubmit={handleCreate}>
          <Input label="Registration Number" value={form.registration_number}
            onChange={(e) => setForm({ ...form, registration_number: e.target.value })} />
          <Input label="Name / Model" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Type" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })} placeholder="e.g. Van, Truck, Bus" />
          <Input label="Max Load Capacity (kg)" type="number" value={form.capacity_kg}
            onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} />
          <Input label="Acquisition Cost" type="number" value={form.acquisition_cost}
            onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} />
          <Input label="Region" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })} />
          {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}
          <Button type="submit" className="w-full">Register</Button>
        </form>
      </Modal>
    </div>
  )
}
