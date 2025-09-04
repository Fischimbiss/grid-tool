import { useState } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import StartPage from './StartPage'
import ManualSystemFormPage from './ManualSystemFormPage'
import GuidedSystemForm from './GuidedSystemForm'
import AgendaPlaceholder from './AgendaPlaceholder'
import type { System } from './mock/systems'

export default function App() {
  const [selectedSystem, setSelectedSystem] = useState<System | undefined>(
    undefined
  )
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <StartPage
            onSelectSystem={(s) => {
              setSelectedSystem(s)
              navigate('/system-detail')
            }}
          />
        }
      />
      <Route
        path="/manual-system"
        element={<ManualSystemFormPage onBack={() => navigate('/')} />}
      />
      <Route
        path="/system-detail"
        element={
          selectedSystem ? (
            <ManualSystemFormPage
              onBack={() => navigate('/')}
              system={selectedSystem}
            />
          ) : (
            <Navigate to="/" />
          )
        }
      />
      <Route
        path="/guided-system"
        element={<GuidedSystemForm onBack={() => navigate('/')} />}
      />
      <Route
        path="/guided-agenda"
        element={
          <AgendaPlaceholder
            onBack={() => navigate('/')}
            title="Geführter Dialog - Tagesordnung"
          />
        }
      />
      <Route
        path="/manual-agenda"
        element={
          <AgendaPlaceholder
            onBack={() => navigate('/')}
            title="Manuelle Tagesordnung"
          />
        }
      />
    </Routes>
  )
}
