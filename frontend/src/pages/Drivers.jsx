import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

const EMPTY_FORM = { name: '', license_number: '', license_category: '', license_expiry: '', contact_number: '', safety_score: 100 }

function SafetyScoreBadge({ score }) {
  const s = Number(score)
  const color = s >= 80 ? 'text-green-700 bg-green-50' : s >= 50 ? 'text-orange-700 bg-orange-50' : 'text-red-700 bg-red-50'
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${color}`}>{score}</span>
}

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  async function fetchDrivers() {
    setLoading(true)
    try {
      const res = await client.get('/drivers/')
      setDrivers(res.data)
      setError('')
    } catch (err) {
      setError('Could not load drivers. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDrivers() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.license_number.trim() || !form.license_expiry || !form.contact_number.trim()) {
      setFormError('Name, license number, license expiry, and contact are required.')
      return
    }
    try {
      await client.post('/drivers/', form)
      setForm(EMPTY_FORM)
      setFormError('')
      setModalOpen(false)
      fetchDrivers()
    } catch (err) {
      const data = err.response?.data
      setFormError(data ? Object.values(data).flat().join(' ') : 'Could not create driver.')
    }
  }

  async function handleSuspend(id, currentStatus) {
    const newStatus = currentStatus === 'Suspended' ? 'Available' : 'Suspended'
    await client.patch(`/drivers/${id}/`, { status: newStatus })
    fetchDrivers()
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{drivers.length} drivers on record</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Add Driver</Button>
      </div>

      {loading && <SkeletonTable rows={4} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && drivers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon="🧑‍✈️"
            title="No drivers on record"
            subtitle="Add a driver profile to start assigning trips."
            actionLabel="+ Add Driver"
            onAction={() => setModalOpen(true)}
          />
        </div>
      )}

      {!loading && !error && drivers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="divide-y divide-gray-100">
            {drivers.map((d) => (
              <div key={d.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-sm font-semibold text-blue-700 shrink-0">
                  {d.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{d.name}</p>
                  <p className="text-xs text-gray-500">License {d.license_number} {d.license_category && `• ${d.license_category}`}</p>
                </div>
                <div className="text-sm text-gray-600">
                  {d.license_expiry}
                  {d.is_license_expired && <span className="ml-2 text-xs text-red-600 font-medium">Expired</span>}
                </div>
                <div className="text-sm text-gray-600">{d.contact_number}</div>
                <SafetyScoreBadge score={d.safety_score} />
                <Badge status={d.status} />
                {(d.status === 'Available' || d.status === 'Suspended') && (
                  <button onClick={() => handleSuspend(d.id, d.status)} className="text-xs text-red-600 hover:underline shrink-0">
                    {d.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Driver">
        <form onSubmit={handleCreate}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="License Number" value={form.license_number}
            onChange={(e) => setForm({ ...form, license_number: e.target.value })} />
          <Input label="License Category" value={form.license_category}
            onChange={(e) => setForm({ ...form, license_category: e.target.value })} placeholder="e.g. Heavy Vehicle" />
          <Input label="License Expiry" type="date" value={form.license_expiry}
            onChange={(e) => setForm({ ...form, license_expiry: e.target.value })} />
          <Input label="Contact Number" value={form.contact_number}
            onChange={(e) => setForm({ ...form, contact_number: e.target.value })} />
          <Input label="Safety Score" type="number" value={form.safety_score}
            onChange={(e) => setForm({ ...form, safety_score: e.target.value })} />
          {formError && <p className="text-sm text-red-600 mb-4">⚠ {formError}</p>}
          <Button type="submit" className="w-full">Add Driver</Button>
        </form>
      </Modal>
    </PageContainer>
  )
}
