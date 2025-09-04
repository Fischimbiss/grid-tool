import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { systems } from './mock/systems'
import type { System } from './mock/systems'
import { sessions } from './mock/sessions'
import { useNavigate } from 'react-router-dom'
import { useUser, UserRole } from './context/UserContext'
import { useTranslation } from 'react-i18next'

interface Props {
  onSelectSystem: (s: System) => void
}

export default function StartPage({ onSelectSystem }: Props) {
  const navigate = useNavigate()
  const { role, setRole, userName, group } = useUser()
  const { t, i18n } = useTranslation()
  const mySystems = systems.filter(
    (s) => s.createdBy === userName || s.fso === userName
  )
  const groupSystems = systems.filter((s) => s.group === group)
  const nextSession = sessions[0]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-4">
        <img src="/grip-logo.svg" alt="GRIP Logo" className="h-12" />
        <h1 className="text-2xl font-bold text-neutral-800">
          <span className="text-[#E20074]">GR</span>
          <span className="text-neutral-800">emien‑</span>
          <span className="text-[#E20074]">I</span>
          <span className="text-neutral-800">ntegrations‑</span>
          <span className="text-[#E20074]">P</span>
          <span className="text-neutral-800">lattform</span>
        </h1>
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium" htmlFor="role-select">
          {t('startPage.roleLabel')}
        </label>
        <select
          id="role-select"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="border rounded p-1"
        >
          <option value="FSysV">F.SysV</option>
          <option value="BR">BR</option>
        </select>
        <select
          aria-label="Sprache"
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="border rounded p-1"
        >
          <option value="de">DE</option>
          <option value="en">EN</option>
        </select>
      </div>

      {role === 'FSysV' && (
        <>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">{t('startPage.newSystem')}</h2>
              <div className="space-x-2">
                <Button onClick={() => navigate('/guided-system')}>Geführter Dialog</Button>
                <Button variant="secondary" onClick={() => navigate('/manual-system')}>
                  Manuell
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">Meine Systeme</h2>
              <ul className="list-disc list-inside text-sm space-y-1">
                {mySystems.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onSelectSystem(s)}
                      className="text-blue-600 hover:underline"
                    >
                      {s.shortName} – {s.categories.basis.shortDescription}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}

      {role === 'BR' && (
        <>
          <Card>
            <CardContent className="p-4 space-y-4">
              <h2 className="text-xl font-semibold">Neue Tagesordnung anlegen</h2>
              <div className="space-x-2">
                <Button onClick={() => navigate('/guided-agenda')}>Geführter Dialog</Button>
                <Button variant="secondary" onClick={() => navigate('/manual-agenda')}>
                  Manuell
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">Systemgruppe</h2>
              <ul className="list-disc list-inside text-sm space-y-1">
                {groupSystems.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => onSelectSystem(s)}
                      className="text-blue-600 hover:underline"
                    >
                      {s.shortName}
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-semibold mb-2">Aktuelle Sitzung</h2>
              {nextSession ? (
                <>
                  <div className="text-sm mb-2">
                    Nächste Sitzung am {new Date(nextSession.date).toLocaleDateString()}
                  </div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {nextSession.agenda.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="text-sm">Keine Sitzung geplant.</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
