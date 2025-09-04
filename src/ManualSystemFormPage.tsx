import ManualForm from './ManualForm'
import { Button } from './components/ui/button'
import type { System } from './mock/systems'
import type { Role } from './StartPage'
import { useEffect } from 'react'

interface Props {
  onBack: () => void
  system?: System
  role: Role
}

export default function ManualSystemFormPage({ onBack, system, role }: Props) {
  useEffect(() => {
    if (!system) {
      localStorage.removeItem('basis-info')
      localStorage.removeItem('roles-badges')
      localStorage.removeItem('commentsBySection')
    }
  }, [system])

  return (
    <div>
      <div className="p-4">
        <Button variant="outline" onClick={onBack}>
          Zurück
        </Button>
      </div>
      <ManualForm system={system} role={role} />
    </div>
  )
}
