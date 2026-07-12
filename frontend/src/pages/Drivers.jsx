import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'

const STATUS_STYLES = {
  Available: 'bg-green-100 text-green-700',
  'On Trip': 'bg-blue-100 text-blue-700',
  'Off Duty': 'bg-gray-200 text-gray-600',
  Suspended: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = { name: '', license_number: '', license_category: '', license_expiry: '', contact_number: '', safety_score: 100 }

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
      const msg = data ? Object.values(data).flat().join(' ') : 'Could not create driver.'
      setFormError(msg)
    }
  }

  async function handleSuspend(id, currentStatus) {
    const newStatus = currentStatus === 'Suspended' ? 'Available' : 'Suspended'
    await client.patch(`/drivers/${id}/`, { status: newStatus })
    fetchDrivers()
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Driver Management</h1>
        <Button onClick={() => setModalOpen(true)}>+ Add Driver</Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">License No.</th>
                <th className="px-4 py-3">License Expiry</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Safety Score</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((d) => (
                <tr key={d.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3">{d.license_number}</td>
                  <td className="px-4 py-3">
                    {d.license_expiry}
                    {d.is_license_expired && <span className="ml-2 text-xs text-red-600 font-medium">Expired</span>}
                  </td>
                  <td className="px-4 py-3">{d.contact_number}</td>
                  <td className="px-4 py-3">{d.safety_score}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {(d.status === 'Available' || d.status === 'Suspended') && (
                      <button onClick={() => handleSuspend(d.id, d.status)} className="text-xs text-red-600 hover:underline">
                        {d.status === 'Suspended' ? 'Reinstate' : 'Suspend'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {drivers.length === 0 && (
                <tr><td colSpan="7" className="px-4 py-6 text-center text-gray-400">No drivers found.</td></tr>
              )}
            </tbody>
          </table>
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
          {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}
          <Button type="submit" className="w-full">Add Driver</Button>
        </form>
      </Modal>
    </div>
  )
}
