import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'
import EmptyState from '../components/EmptyState'
import { SkeletonTable } from '../components/Skeleton'
import PageContainer from '../components/PageContainer'

const EXPENSE_CATEGORIES = ['Toll', 'Maintenance', 'Other']
const CATEGORY_ICONS = { Toll: '🛣️', Maintenance: '🔧', Other: '📎' }

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [fuelModalOpen, setFuelModalOpen] = useState(false)
  const [fuelForm, setFuelForm] = useState({ vehicle: '', liters: '', cost: '', date: '' })
  const [fuelError, setFuelError] = useState('')

  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [expenseForm, setExpenseForm] = useState({ vehicle: '', category: 'Toll', amount: '', description: '', date: '' })
  const [expenseError, setExpenseError] = useState('')

  async function fetchAll() {
    setLoading(true)
    try {
      const [fuelRes, expenseRes, vehRes] = await Promise.all([
        client.get('/fuel-logs/'),
        client.get('/expenses/'),
        client.get('/vehicles/'),
      ])
      setFuelLogs(fuelRes.data)
      setExpenses(expenseRes.data)
      setVehicles(vehRes.data)
      setError('')
    } catch (err) {
      setError('Could not load fuel/expense data. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  async function handleFuelCreate(e) {
    e.preventDefault()
    if (!fuelForm.vehicle || !fuelForm.liters || !fuelForm.cost) {
      setFuelError('Vehicle, liters, and cost are required.')
      return
    }
    try {
      const payload = { ...fuelForm }
      if (!payload.date) delete payload.date
      await client.post('/fuel-logs/', payload)
      setFuelForm({ vehicle: '', liters: '', cost: '', date: '' })
      setFuelError('')
      setFuelModalOpen(false)
      fetchAll()
    } catch (err) {
      const data = err.response?.data
      setFuelError(data ? Object.values(data).flat().join(' ') : 'Could not create fuel log.')
    }
  }

  async function handleExpenseCreate(e) {
    e.preventDefault()
    if (!expenseForm.vehicle || !expenseForm.amount) {
      setExpenseError('Vehicle and amount are required.')
      return
    }
    try {
      const payload = { ...expenseForm }
      if (!payload.date) delete payload.date
      await client.post('/expenses/', payload)
      setExpenseForm({ vehicle: '', category: 'Toll', amount: '', description: '', date: '' })
      setExpenseError('')
      setExpenseModalOpen(false)
      fetchAll()
    } catch (err) {
      const data = err.response?.data
      setExpenseError(data ? Object.values(data).flat().join(' ') : 'Could not create expense.')
    }
  }

  const totalFuelCost = fuelLogs.reduce((sum, f) => sum + Number(f.cost), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <PageContainer>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel & Expenses</h1>
          <p className="text-sm text-gray-500 mt-0.5">₹{totalFuelCost.toFixed(2)} fuel • ₹{totalExpenses.toFixed(2)} other expenses</p>
        </div>
      </div>

      {loading && <SkeletonTable rows={3} />}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fuel logging */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">⛽ Fuel Logs</h3>
              <Button variant="secondary" onClick={() => setFuelModalOpen(true)} className="text-xs px-3 py-1.5">+ Log Fuel</Button>
            </div>
            {fuelLogs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl">
                <EmptyState icon="⛽" title="No fuel logs yet" subtitle="Fuel is also auto-logged when you complete a trip." />
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm">
                {fuelLogs.map((f) => (
                  <div key={f.id} className="px-4 py-3 flex justify-between items-center text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{f.vehicle_registration}</p>
                      <p className="text-gray-400 text-xs">{f.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900">{f.liters} L</p>
                      <p className="text-gray-500 text-xs">₹{f.cost}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expenses */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">💳 Expenses</h3>
              <Button variant="secondary" onClick={() => setExpenseModalOpen(true)} className="text-xs px-3 py-1.5">+ Log Expense</Button>
            </div>
            {expenses.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl">
                <EmptyState icon="💳" title="No expenses yet" subtitle="Log tolls, repairs, or other operational costs." />
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden shadow-sm">
                {expenses.map((ex) => (
                  <div key={ex.id} className="px-4 py-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span>{CATEGORY_ICONS[ex.category]}</span>
                      <div>
                        <p className="font-medium text-gray-900">{ex.vehicle_registration} — {ex.category}</p>
                        <p className="text-gray-400 text-xs">{ex.description || ex.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-900">₹{ex.amount}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Log Fuel">
        <form onSubmit={handleFuelCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle</label>
            <select value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
              ))}
            </select>
          </div>
          <Input label="Liters" type="number" value={fuelForm.liters}
            onChange={(e) => setFuelForm({ ...fuelForm, liters: e.target.value })} />
          <Input label="Cost" type="number" value={fuelForm.cost}
            onChange={(e) => setFuelForm({ ...fuelForm, cost: e.target.value })} />
          <Input label="Date" type="date" value={fuelForm.date}
            onChange={(e) => setFuelForm({ ...fuelForm, date: e.target.value })} />
          {fuelError && <p className="text-sm text-red-600 mb-4">⚠ {fuelError}</p>}
          <Button type="submit" className="w-full">Log Fuel</Button>
        </form>
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Log Expense">
        <form onSubmit={handleExpenseCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle</label>
            <select value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <div className="flex gap-2">
              {EXPENSE_CATEGORIES.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setExpenseForm({ ...expenseForm, category: c })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                    expenseForm.category === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {CATEGORY_ICONS[c]} {c}
                </button>
              ))}
            </div>
          </div>
          <Input label="Amount" type="number" value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <Input label="Description" value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <Input label="Date" type="date" value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          {expenseError && <p className="text-sm text-red-600 mb-4">⚠ {expenseError}</p>}
          <Button type="submit" className="w-full">Log Expense</Button>
        </form>
      </Modal>
    </PageContainer>
  )
}
