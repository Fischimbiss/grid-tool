import { useState } from 'react'
import StartPage, { Role } from './StartPage'
import ManualSystemFormPage from './ManualSystemFormPage'
import GuidedSystemPlaceholder from './GuidedSystemPlaceholder'
import AgendaPlaceholder from './AgendaPlaceholder'

 type Page =
  | 'start'
  | 'manual-system'
  | 'guided-system'
  | 'guided-agenda'
  | 'manual-agenda'

export default function App() {
  const [role, setRole] = useState<Role>('FSysV')
  const [page, setPage] = useState<Page>('start')

  const goStart = () => setPage('start')

  if (page === 'manual-system') return <ManualSystemFormPage onBack={goStart} />
  if (page === 'guided-system') return <GuidedSystemPlaceholder onBack={goStart} />
  if (page === 'guided-agenda')
    return <AgendaPlaceholder onBack={goStart} title="Geführter Dialog - Tagesordnung" />
  if (page === 'manual-agenda')
    return <AgendaPlaceholder onBack={goStart} title="Manuelle Tagesordnung" />

  return <StartPage role={role} onRoleChange={setRole} navigate={setPage} />
}
