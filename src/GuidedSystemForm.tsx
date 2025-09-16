import { useState } from 'react'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Checkbox } from './components/ui/checkbox'
import { systems, type SystemRole, type System } from './mock/systems'
import { useUser } from './context/UserContext'
import { useNavigate } from 'react-router-dom'

const steps = ['Basisinformationen', 'Rollen/Berechtigungen', 'Künstliche Intelligenz']

export default function GuidedSystemForm({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(0)
  const { userName, group, role } = useUser()
  const navigate = useNavigate()
  const canEdit = role === 'FSysV'

  // Basisinformationen
  const [basis, setBasis] = useState({
    shortName: '',
    longName: '',
    psi: '',
    appId: '',
    shortDescription: '',
  })

  // Rollen
  const [roles, setRoles] = useState<SystemRole[]>([])
  const [roleDraft, setRoleDraft] = useState({
    number: '',
    systemName: '',
    shopName: '',
    userName: '',
    tasks: '',
    permissions: '',
  })

  // KI
  const [aiPresent, setAiPresent] = useState(false)
  const [aiPurpose, setAiPurpose] = useState('')

  const next = () => canEdit && setStep((s) => Math.min(s + 1, steps.length - 1))
  const prev = () => canEdit && setStep((s) => Math.max(s - 1, 0))

  const addRole = () => {
    if (!canEdit) return
    if (!roleDraft.number || !roleDraft.systemName) return
    const newRole: SystemRole = {
      id: roles.length + 1,
      number: roleDraft.number,
      systemName: roleDraft.systemName,
      shopName: roleDraft.shopName,
      userName: roleDraft.userName,
      tasks: roleDraft.tasks.split(',').map((t) => t.trim()).filter(Boolean),
      permissions: roleDraft.permissions.split(',').map((p) => p.trim()).filter(Boolean),
    }
    setRoles([...roles, newRole])
    setRoleDraft({ number: '', systemName: '', shopName: '', userName: '', tasks: '', permissions: '' })
  }

  const finish = () => {
    if (!canEdit) return
    const newSystem: System = {
      id: systems.length + 1,
      shortName: basis.shortName,
      longName: basis.longName,
      group,
      createdBy: userName,
      fso: userName,
      categories: {
        basis: {
          psi: basis.psi,
          appId: basis.appId,
          shortDescription: basis.shortDescription,
          matrix: {},
        },
        system: { type: '', technology: '' },
        interfaces: [],
        roles,
        reports: [],
        privacy: { personalData: false },
        ai: { ai_present: aiPresent, purpose: aiPurpose },
      },
    }
    systems.push(newSystem)
    navigate('/')
  }

  return (
    <div className="p-6 space-y-4">
      <Button variant="outline" onClick={onBack}>
        Zurück
      </Button>
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Geführter Dialog - Systemanlage</h2>
          <div className="text-sm font-medium">
            Schritt {step + 1} von {steps.length}: {steps[step]}
          </div>

          <fieldset disabled={!canEdit} className="space-y-4">
          {step === 0 && (
            <div className="space-y-2">
              <Input
                placeholder="Name/Kurzbezeichnung"
                value={basis.shortName}
                onChange={(e) => setBasis({ ...basis, shortName: e.target.value })}
              />
              <Input
                placeholder="Langbezeichnung"
                value={basis.longName}
                onChange={(e) => setBasis({ ...basis, longName: e.target.value })}
              />
              <Input
                placeholder="PSI-Nummer"
                value={basis.psi}
                onChange={(e) => setBasis({ ...basis, psi: e.target.value })}
              />
              <Input
                placeholder="T-App-ID/Sol-App-ID"
                value={basis.appId}
                onChange={(e) => setBasis({ ...basis, appId: e.target.value })}
              />
              <Textarea
                placeholder="Kurzbeschreibung"
                value={basis.shortDescription}
                onChange={(e) => setBasis({ ...basis, shortDescription: e.target.value })}
              />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-2">
              <Input
                placeholder="Rollen-Nummer"
                value={roleDraft.number}
                onChange={(e) => setRoleDraft({ ...roleDraft, number: e.target.value })}
              />
              <Input
                placeholder="Rollenname im System"
                value={roleDraft.systemName}
                onChange={(e) => setRoleDraft({ ...roleDraft, systemName: e.target.value })}
              />
              <Input
                placeholder="Name im Rollenshop"
                value={roleDraft.shopName}
                onChange={(e) => setRoleDraft({ ...roleDraft, shopName: e.target.value })}
              />
              <Input
                placeholder="Nutzer der Rolle"
                value={roleDraft.userName}
                onChange={(e) => setRoleDraft({ ...roleDraft, userName: e.target.value })}
              />
              <Input
                placeholder="Prozessuale Aufgaben (kommagetrennt)"
                value={roleDraft.tasks}
                onChange={(e) => setRoleDraft({ ...roleDraft, tasks: e.target.value })}
              />
              <Input
                placeholder="IT-Berechtigungen (kommagetrennt)"
                value={roleDraft.permissions}
                onChange={(e) => setRoleDraft({ ...roleDraft, permissions: e.target.value })}
              />
              <Button type="button" onClick={addRole}>
                Rolle hinzufügen
              </Button>
              <ul className="list-disc list-inside text-sm">
                {roles.map((r) => (
                  <li key={r.id}>
                    {r.number} – {r.systemName}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ai-present"
                  checked={aiPresent}
                  onCheckedChange={(checked) => setAiPresent(!!checked)}
                />
                <label htmlFor="ai-present" className="text-sm">
                  Künstliche Intelligenz im Einsatz?
                </label>
              </div>
              {aiPresent && (
                <Textarea
                  placeholder="Zweck der KI"
                  value={aiPurpose}
                  onChange={(e) => setAiPurpose(e.target.value)}
                />
              )}
            </div>
          )}
          </fieldset>

          <div className="flex justify-between pt-4">
            {step > 0 && (
              <Button variant="secondary" onClick={prev}>
                Zurück
              </Button>
            )}
            {step < steps.length - 1 && (
              <Button onClick={next} disabled={!canEdit || (step === 0 && !basis.shortName)}>
                Weiter
              </Button>
            )}
            {step === steps.length - 1 && (
              <Button onClick={finish} disabled={!canEdit || !basis.shortName}>
                Fertigstellen
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

