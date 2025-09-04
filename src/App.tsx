import { useState } from 'react'
import StartPage, { Role } from './StartPage'
import ManualSystemFormPage from './ManualSystemFormPage'
import GuidedSystemPlaceholder from './GuidedSystemPlaceholder'
import AgendaPlaceholder from './AgendaPlaceholder'
import type { System } from './mock/systems'

 type Page =
  | 'start'
  | 'manual-system'
  | 'guided-system'
  | 'guided-agenda'
  | 'manual-agenda'
  | 'system-detail'

export default function App() {
  const [role, setRole] = useState<Role>('FSysV')
  const [page, setPage] = useState<Page>('start')
  const [selectedSystem, setSelectedSystem] = useState<System | undefined>(undefined)

  const goStart = () => setPage('start')

  if (page === 'manual-system') return <ManualSystemFormPage onBack={goStart} role={role} />
  if (page === 'system-detail' && selectedSystem)
    return <ManualSystemFormPage onBack={goStart} role={role} system={selectedSystem} />
  if (page === 'guided-system') return <GuidedSystemPlaceholder onBack={goStart} />
  if (page === 'guided-agenda')
    return <AgendaPlaceholder onBack={goStart} title="Geführter Dialog - Tagesordnung" />
  if (page === 'manual-agenda')
    return <AgendaPlaceholder onBack={goStart} title="Manuelle Tagesordnung" />

  return (
    <StartPage
      role={role}
      onRoleChange={setRole}
      navigate={setPage}
      onSelectSystem={(s) => {
        setSelectedSystem(s)
        setPage('system-detail')
      }}
    />
  )
}
