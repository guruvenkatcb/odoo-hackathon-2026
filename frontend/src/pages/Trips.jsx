import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

const EMPTY_FORM = { source: '', destination: '', vehicle: '', driver: '', cargo_weight: '', planned_distance: '', revenue: '' }

export default function Trips() {
  const [trips, setTrips] = useState([])
  const [availableVehicles, setAvailableVehicles] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [completeModal, setCompleteModal] = useState(null)
  const [completeForm, setCompleteForm] = useState({ end_odometer: '', fuel_consumed: '', fuel_cost: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
      const [tripsRes, vehRes, drvRes] = await Promise.all([
        client.get('/trips/'),
        client.get('/vehicles/', { params: { dispatch_pool: 'true' } }),
        client.get('/drivers/', { params: { dispatch_pool: 'true' } }),
      ])
      setTrips(tripsRes.data)
      setAvailableVehicles(vehRes.data)
      setAvailableDrivers(drvRes.data)
      setError('')
    } catch (err) {
      setError('Could not load trips. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const selectedVehicle = availableVehicles.find((v) => String(v.id) === String(form.vehicle))
  const cargoOverLimit = selectedVehicle && form.cargo_weight && Number(form.cargo_weight) > Number(selectedVehicle.capacity_kg)

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.source || !form.destination || !form.vehicle || !form.driver || !form.cargo_weight || !form.planned_distance) {
      setFormError('All fields except revenue are required.')
      return
    }
    try {
      await client.post('/trips/', form)
      setForm(EMPTY_FORM)
      setFormError('')
      setModalOpen(false)
      fetchAll()
    } catch (err) {
      const data = err.response?.data
      const msg = data?.non_field_errors?.join(' ') || (data ? Object.values(data).flat().join(' ') : 'Could not create trip.')
      setFormError(msg)
    }
  }

  async function handleDispatch(id) {
    try {
      await client.post(`/trips/${id}/dispatch_trip/`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not dispatch trip.')
    }
  }

  async function handleCancel(id) {
    try {
      await client.post(`/trips/${id}/cancel_trip/`)
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not cancel trip.')
    }
  }

  async function handleComplete(e) {
    e.preventDefault()
    try {
      await client.post(`/trips/${completeModal}/complete_trip/`, completeForm)
      setCompleteModal(null)
      setCompleteForm({ end_odometer: '', fuel_consumed: '', fuel_cost: '' })
      fetchAll()
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not complete trip.')
    }
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trip Dispatch Desk</h1>
          <p className="text-sm text-gray-500 mt-0.5">{trips.length} total trips</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Trip</Button>
      </div>

      {loading && <SkeletonTable rows={4} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && trips.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon="🗺️"
            title="No trips yet"
            subtitle="Create a trip to dispatch a vehicle and driver."
            actionLabel="+ New Trip"
            onAction={() => setModalOpen(true)}
          />
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="space-y-3">
          {trips.map((t) => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{t.source} → {t.destination}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    🚚 {t.vehicle_registration} &nbsp;•&nbsp; 🧑‍✈️ {t.driver_name} &nbsp;•&nbsp; {t.cargo_weight}kg &nbsp;•&nbsp; {t.planned_distance}km
                  </p>
                </div>
                <Badge status={t.status} />
              </div>
              <div className="mt-3 flex gap-2">
                {t.status === 'Draft' && (
                  <Button onClick={() => handleDispatch(t.id)} className="text-xs px-3 py-1.5">⚡ Dispatch</Button>
                )}
                {t.status === 'Dispatched' && (
                  <>
                    <Button onClick={() => setCompleteModal(t.id)} className="text-xs px-3 py-1.5">✓ Complete</Button>
                    <Button variant="danger" onClick={() => handleCancel(t.id)} className="text-xs px-3 py-1.5">Cancel</Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Trip">
        <form onSubmit={handleCreate}>
          <Input label="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <Input label="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle (Available only)</label>
            <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select a vehicle</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_number} — {v.name} (max {v.capacity_kg}kg)</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Driver (Available only)</label>
            <select value={form.driver} onChange={(e) => setForm({ ...form, driver: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select a driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <Input label="Cargo Weight (kg)" type="number" value={form.cargo_weight}
            onChange={(e) => setForm({ ...form, cargo_weight: e.target.value })} />

          {selectedVehicle && form.cargo_weight && (
            <div className={`mb-4 -mt-2 px-3 py-2 rounded-lg text-xs font-medium ${
              cargoOverLimit ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20' : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
            }`}>
              {cargoOverLimit
                ? `⚠ Exceeds ${selectedVehicle.registration_number}'s ${selectedVehicle.capacity_kg}kg capacity`
                : `✓ Within ${selectedVehicle.registration_number}'s ${selectedVehicle.capacity_kg}kg capacity`}
            </div>
          )}

          <Input label="Planned Distance (km)" type="number" value={form.planned_distance}
            onChange={(e) => setForm({ ...form, planned_distance: e.target.value })} />
          <Input label="Expected Revenue (optional)" type="number" value={form.revenue}
            onChange={(e) => setForm({ ...form, revenue: e.target.value })} />

          {formError && <p className="text-sm text-red-600 mb-4">⚠ {formError}</p>}
          <Button type="submit" className="w-full" disabled={cargoOverLimit}>Create Trip</Button>
        </form>
      </Modal>

      <Modal open={!!completeModal} onClose={() => setCompleteModal(null)} title="Complete Trip">
        <form onSubmit={handleComplete}>
          <Input label="Final Odometer" type="number" value={completeForm.end_odometer}
            onChange={(e) => setCompleteForm({ ...completeForm, end_odometer: e.target.value })} />
          <Input label="Fuel Consumed (L)" type="number" value={completeForm.fuel_consumed}
            onChange={(e) => setCompleteForm({ ...completeForm, fuel_consumed: e.target.value })} />
          <Input label="Fuel Cost" type="number" value={completeForm.fuel_cost}
            onChange={(e) => setCompleteForm({ ...completeForm, fuel_cost: e.target.value })} />
          <Button type="submit" className="w-full">Complete Trip</Button>
        </form>
      </Modal>
    </PageContainer>
  )
}
