import ManualForm from './ManualForm'
import { Button } from './components/ui/button'
import type { System } from './mock/systems'
import type { Role } from './StartPage'

interface Props {
  onBack: () => void
  system?: System
  role: Role
}

export default function ManualSystemFormPage({ onBack, system, role }: Props) {
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
