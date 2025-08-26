import { useState } from 'react'

type Role = { id: number; name: string }

export default function Roles() {
  const [items, setItems] = useState<Role[]>([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  const add = () => {
    if (!name.trim()) return
    setItems([...items, { id: Date.now(), name }])
    setName('')
  }

  const startEdit = (id: number, current: string) => {
    setEditing(id)
    setEditName(current)
  }

  const saveEdit = () => {
    if (editing === null) return
    setItems(items.map(r => (r.id === editing ? { ...r, name: editName } : r)))
    setEditing(null)
    setEditName('')
  }

  const remove = (id: number) => setItems(items.filter(r => r.id !== id))

  return (
    <div>
      <h3 className="font-semibold mb-2">Roles</h3>
      <div className="flex gap-2 mb-2">
        <input className="border px-2 py-1 flex-1" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <button className="bg-blue-500 text-white px-2" onClick={add}>Add</button>
      </div>
      <ul className="space-y-1">
        {items.map(r => (
          <li key={r.id} className="flex justify-between items-center border px-2 py-1">
            {editing === r.id ? (
              <input className="border px-1 flex-1 mr-2" value={editName} onChange={e => setEditName(e.target.value)} />
            ) : (
              <span className="flex-1">{r.name}</span>
            )}
            {editing === r.id ? (
              <button className="text-green-600 mr-2" onClick={saveEdit}>Save</button>
            ) : (
              <button className="text-blue-600 mr-2" onClick={() => startEdit(r.id, r.name)}>Edit</button>
            )}
            <button className="text-red-600" onClick={() => remove(r.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
