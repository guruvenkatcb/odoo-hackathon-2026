import { useEffect, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Button from '../components/Button'
import Modal from '../components/Modal'
import Input from '../components/Input'

// This page demonstrates the full CRUD loop against the sample "Item" model.
// Replace "items" / "Item" throughout with your real hackathon resource
// (e.g. tasks, bookings, tickets) — the pattern stays identical.

export default function Home() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [formError, setFormError] = useState('')

  async function fetchItems() {
    setLoading(true)
    try {
      const res = await client.get('/items/')
      setItems(res.data)
      setError('')
    } catch (err) {
      setError('Could not load items. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!title.trim()) {
      setFormError('Title is required.')
      return
    }
    try {
      await client.post('/items/', { title, description })
      setTitle('')
      setDescription('')
      setFormError('')
      setModalOpen(false)
      fetchItems()
    } catch (err) {
      setFormError('Could not create item. Are you logged in?')
    }
  }

  async function handleDelete(id) {
    await client.delete(`/items/${id}/`)
    fetchItems()
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Items</h1>
        {user && <Button onClick={() => setModalOpen(true)}>+ New Item</Button>}
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-500">No items yet. {user ? 'Create one above.' : 'Log in to add one.'}</p>
      )}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
              {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
              <p className="text-xs text-gray-400 mt-2">by {item.owner_username}</p>
            </div>
            {user?.username === item.owner_username && (
              <Button variant="danger" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Item">
        <form onSubmit={handleCreate}>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          {formError && <p className="text-sm text-red-600 mb-4">{formError}</p>}
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Modal>
    </div>
  )
}
