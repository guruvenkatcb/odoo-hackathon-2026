import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

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

  const openLogs = logs.filter((l) => l.status === 'Open')
  const closedLogs = logs.filter((l) => l.status === 'Closed')

  function LogRow({ log, showClose }) {
    return (
      <div className="px-5 py-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-gray-900">{log.vehicle_registration} — {log.description}</p>
          <p className="text-sm text-gray-500">₹{log.cost}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge status={log.status} />
          {showClose && (
            <Button onClick={() => handleClose(log.id)} className="text-xs px-3 py-1.5">Close</Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-gray-500 mt-0.5">{openLogs.length} active in shop</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ New Record</Button>
      </div>

      {loading && <SkeletonTable rows={3} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && logs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl">
          <EmptyState
            icon="🔧"
            title="No maintenance records"
            subtitle="Log a maintenance task and the vehicle will automatically move to 'In Shop'."
            actionLabel="+ New Record"
            onAction={() => setModalOpen(true)}
          />
        </div>
      )}

      {!loading && !error && logs.length > 0 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Active ({openLogs.length})</h3>
            <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm">
              {openLogs.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">No vehicles currently in the shop.</p>}
              {openLogs.map((log) => <LogRow key={log.id} log={log} showClose />)}
            </div>
          </div>

          {closedLogs.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">History ({closedLogs.length})</h3>
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm opacity-80">
                {closedLogs.map((log) => <LogRow key={log.id} log={log} showClose={false} />)}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Maintenance Record">
        <form onSubmit={handleCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle</label>
            <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
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
          {formError && <p className="text-sm text-red-600 mb-4">⚠ {formError}</p>}
          <Button type="submit" className="w-full">Create Record</Button>
        </form>
      </Modal>
    </PageContainer>
  )
}
