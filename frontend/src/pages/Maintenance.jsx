import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'

export default function Maintenance() {
  const [logs, setLogs] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ vehicle: '', description: '', cost: '' })
  const [formError, setFormError] = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
      const [logRes, vehRes] = await Promise.all([
        client.get('/maintenance/'),
        client.get('/vehicles/'),
      ])
      setLogs(logRes.data)
      setVehicles(vehRes.data)
      setError('')
    } catch (err) {
      setError('Could not load maintenance logs. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.vehicle || !form.description.trim()) {
      setFormError('Vehicle and description are required.')
      return
    }
    try {
      await client.post('/maintenance/', form)
      setForm({ vehicle: '', description: '', cost: '' })
      setFormError('')
      setModalOpen(false)
      fetchAll()
    } catch (err) {
      setFormError('Could not create maintenance record.')
    }
  }

  async function handleClose(id) {
    await client.post(`/maintenance/${id}/close/`)
    fetchAll()
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
        <Button onClick={() => setModalOpen(true)}>+ New Record</Button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">{log.vehicle_registration} — {log.description}</p>
                <p className="text-sm text-gray-500">Cost: ₹{log.cost} • {log.status}</p>
              </div>
              {log.status === 'Open' && (
                <Button onClick={() => handleClose(log.id)} className="text-xs px-3 py-1">Close</Button>
              )}
            </div>
          ))}
          {logs.length === 0 && <p className="text-gray-400">No maintenance records yet.</p>}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Maintenance Record">
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
              ))}
            </select>
          </div>
          <Input label="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Oil Change" />
          <Input label="Cost" type="number" value={form.cost}
            onChange={(e) => setForm({ ...form, cost: e.target.value })} />
          {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}
          <Button type="submit" className="w-full">Create Record</Button>
        </form>
      </Modal>
    </div>
  )
}
