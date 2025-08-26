import Users from './Users'
import Roles from './Roles'
import Groups from './Groups'

export default function AdminPanel() {
  return (
    <div className="p-4 bg-white shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Users />
        <Roles />
        <Groups />
      </div>
    </div>
  )
}
