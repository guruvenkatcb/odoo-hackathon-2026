import { useEffect, useState } from 'react'
import client from '../api/client'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'

const EXPENSE_CATEGORIES = ['Toll', 'Maintenance', 'Other']

export default function FuelExpenses() {
  const [fuelLogs, setFuelLogs] = useState([])
  const [expenses, setExpenses] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('fuel') // 'fuel' | 'expenses'

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

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Fuel & Expenses</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('fuel')}
          className={`text-sm px-4 py-2 rounded-lg border ${
            tab === 'fuel' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Fuel Logs
        </button>
        <button
          onClick={() => setTab('expenses')}
          className={`text-sm px-4 py-2 rounded-lg border ${
            tab === 'expenses' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-300'
          }`}
        >
          Expenses
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && tab === 'fuel' && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setFuelModalOpen(true)}>+ Log Fuel</Button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Liters</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {fuelLogs.map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{f.vehicle_registration}</td>
                    <td className="px-4 py-3">{f.liters} L</td>
                    <td className="px-4 py-3">₹{f.cost}</td>
                    <td className="px-4 py-3">{f.date}</td>
                  </tr>
                ))}
                {fuelLogs.length === 0 && (
                  <tr><td colSpan="4" className="px-4 py-6 text-center text-gray-400">No fuel logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !error && tab === 'expenses' && (
        <>
          <div className="flex justify-end mb-4">
            <Button onClick={() => setExpenseModalOpen(true)}>+ Log Expense</Button>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-left">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((ex) => (
                  <tr key={ex.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium">{ex.vehicle_registration}</td>
                    <td className="px-4 py-3">{ex.category}</td>
                    <td className="px-4 py-3">₹{ex.amount}</td>
                    <td className="px-4 py-3">{ex.description || '—'}</td>
                    <td className="px-4 py-3">{ex.date}</td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr><td colSpan="5" className="px-4 py-6 text-center text-gray-400">No expenses yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={fuelModalOpen} onClose={() => setFuelModalOpen(false)} title="Log Fuel">
        <form onSubmit={handleFuelCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select value={fuelForm.vehicle} onChange={(e) => setFuelForm({ ...fuelForm, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
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
          {fuelError && <p className="text-sm text-red-600 mb-4">{fuelError}</p>}
          <Button type="submit" className="w-full">Log Fuel</Button>
        </form>
      </Modal>

      <Modal open={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} title="Log Expense">
        <form onSubmit={handleExpenseCreate}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
            <select value={expenseForm.vehicle} onChange={(e) => setExpenseForm({ ...expenseForm, vehicle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">Select a vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.registration_number} — {v.name}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Amount" type="number" value={expenseForm.amount}
            onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          <Input label="Description" value={expenseForm.description}
            onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
          <Input label="Date" type="date" value={expenseForm.date}
            onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          {expenseError && <p className="text-sm text-red-600 mb-4">{expenseError}</p>}
          <Button type="submit" className="w-full">Log Expense</Button>
        </form>
      </Modal>
    </div>
  )
}
