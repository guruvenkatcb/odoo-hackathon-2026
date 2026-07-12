import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

const TYPE_ICONS = { Van: '🚐', Truck: '🚚', Trailer: '🚛', Bus: '🚌' }
const getIcon = (type) => TYPE_ICONS[type] || '🚗'

const EMPTY_FORM = { registration_number: '', name: '', type: '', capacity_kg: '', acquisition_cost: '', region: '' }
const STATUS_FILTERS = ['', 'Available', 'On Trip', 'In Shop', 'Retired']

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [search, setSearch] = useState('')

  async function fetchVehicles() {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter
      const res = await client.get('/vehicles/', { params })
      setVehicles(res.data)
      setError('')
    } catch (err) {
      setError('Could not load vehicles. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVehicles() }, [statusFilter, typeFilter])

  const visibleVehicles = vehicles.filter((v) =>
    !search || v.registration_number.toLowerCase().includes(search.toLowerCase()) || v.name.toLowerCase().includes(search.toLowerCase())
  )

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
      setFormError(data ? Object.values(data).flat().join(' ') : 'Could not create vehicle.')
    }
  }

  async function handleRetire(id) {
    await client.patch(`/vehicles/${id}/`, { status: 'Retired' })
    fetchVehicles()
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Registry</h1>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicles in fleet</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Register Vehicle</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by registration or name..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
          <option value="">All Types</option>
          {Object.keys(TYPE_ICONS).map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading && <SkeletonTable rows={4} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && visibleVehicles.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon="🚚"
            title="No vehicles registered yet"
            subtitle="Add your first vehicle to start dispatching trips and tracking your fleet."
            actionLabel="+ Register Vehicle"
            onAction={() => setModalOpen(true)}
          />
        </div>
      )}

      {!loading && !error && visibleVehicles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleVehicles.map((v) => (
            <div key={v.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-xl">
                    {getIcon(v.type)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{v.registration_number}</p>
                    <p className="text-sm text-gray-500">{v.name}</p>
                  </div>
                </div>
                <Badge status={v.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Capacity</p>
                  <p className="text-gray-900 font-medium">{v.capacity_kg} kg</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Odometer</p>
                  <p className="text-gray-900 font-medium">{v.odometer} km</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Value</p>
                  <p className="text-gray-900 font-medium">₹{v.acquisition_cost}</p>
                </div>
              </div>
              {v.status !== 'Retired' && (
                <button onClick={() => handleRetire(v.id)} className="mt-3 text-xs text-red-600 hover:underline">
                  Retire vehicle
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Register Vehicle">
        <form onSubmit={handleCreate}>
          <Input label="Registration Number" value={form.registration_number}
            onChange={(e) => setForm({ ...form, registration_number: e.target.value })} />
          <Input label="Name / Model" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select type</option>
              {Object.keys(TYPE_ICONS).map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Max Load Capacity (kg)" type="number" value={form.capacity_kg}
            onChange={(e) => setForm({ ...form, capacity_kg: e.target.value })} />
          <Input label="Acquisition Cost" type="number" value={form.acquisition_cost}
            onChange={(e) => setForm({ ...form, acquisition_cost: e.target.value })} />
          <Input label="Region" value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })} />
          {formError && <p className="text-sm text-red-600 mb-4">⚠ {formError}</p>}
          <Button type="submit" className="w-full">Register</Button>
        </form>
      </Modal>
    </PageContainer>
  )
}
