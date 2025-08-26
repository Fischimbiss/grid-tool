import { useState } from 'react'

type User = { id: number; name: string }

export default function Users() {
  const [items, setItems] = useState<User[]>([])
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
    setItems(items.map(u => (u.id === editing ? { ...u, name: editName } : u)))
    setEditing(null)
    setEditName('')
  }

  const remove = (id: number) => setItems(items.filter(u => u.id !== id))

  return (
    <div>
      <h3 className="font-semibold mb-2">Users</h3>
      <div className="flex gap-2 mb-2">
        <input className="border px-2 py-1 flex-1" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <button className="bg-blue-500 text-white px-2" onClick={add}>Add</button>
      </div>
      <ul className="space-y-1">
        {items.map(u => (
          <li key={u.id} className="flex justify-between items-center border px-2 py-1">
            {editing === u.id ? (
              <input className="border px-1 flex-1 mr-2" value={editName} onChange={e => setEditName(e.target.value)} />
            ) : (
              <span className="flex-1">{u.name}</span>
            )}
            {editing === u.id ? (
              <button className="text-green-600 mr-2" onClick={saveEdit}>Save</button>
            ) : (
              <button className="text-blue-600 mr-2" onClick={() => startEdit(u.id, u.name)}>Edit</button>
            )}
            <button className="text-red-600" onClick={() => remove(u.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
