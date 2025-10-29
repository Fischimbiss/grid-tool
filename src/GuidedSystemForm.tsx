import { useEffect, useState } from 'react'
import { Card, CardContent } from './components/ui/card'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { Checkbox } from './components/ui/checkbox'
import { Select } from './components/ui/select'
import { InfoTooltip } from './components/InfoTooltip'
import {
  systems,
  type SystemRole,
  type System,
  type RegulationStatus,
  type DevelopmentStatus,
  type SystemPropertyOption,
  type UiTypeOption,
  type TenantSeparationOption
} from './mock/systems'
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
    psi: '',
    shortName: '',
    longName: '',
    regulationStatus: 'Neu' as RegulationStatus,
    developmentStatus: 'in Vorbereitung' as DevelopmentStatus,
    replacingLegacy: false,
    legacyPsi: '',
    legacyShortName: '',
    legacyNotes: '',
    shortDescription: '',
    aiPlanned: false,
    interfacesPlanned: false,
    systemProperty: 'none' as SystemPropertyOption,
    uiType: 'gui' as UiTypeOption,
    tenantSeparation: 'none' as TenantSeparationOption,
  })
  const [shortNameEdited, setShortNameEdited] = useState(false)
  const [longNameEdited, setLongNameEdited] = useState(false)
  const [legacyShortNameEdited, setLegacyShortNameEdited] = useState(false)

  useEffect(() => {
    if (!basis.psi.trim()) return
    const match = systems.find((s) => s.categories.basis.psi.toLowerCase() === basis.psi.trim().toLowerCase())
    if (!match) return
    setBasis((prev) => {
      let changed = false
      const next = { ...prev }
      if (!shortNameEdited && prev.shortName !== match.shortName) {
        next.shortName = match.shortName
        changed = true
      }
      if (!longNameEdited && prev.longName !== match.longName) {
        next.longName = match.longName
        changed = true
      }
      return changed ? next : prev
    })
  }, [basis.psi, longNameEdited, shortNameEdited])

  useEffect(() => {
    if (!basis.replacingLegacy) {
      setLegacyShortNameEdited(false)
      if (basis.legacyPsi || basis.legacyShortName || basis.legacyNotes) {
        setBasis((prev) => ({
          ...prev,
          legacyPsi: '',
          legacyShortName: '',
          legacyNotes: '',
        }))
      }
      return
    }
    if (!basis.legacyPsi.trim() || legacyShortNameEdited) return
    const match = systems.find((s) => s.categories.basis.psi.toLowerCase() === basis.legacyPsi.trim().toLowerCase())
    if (!match) return
    setBasis((prev) => (prev.legacyShortName === match.shortName ? prev : { ...prev, legacyShortName: match.shortName }))
  }, [basis.legacyPsi, basis.legacyNotes, basis.legacyShortName, basis.replacingLegacy, legacyShortNameEdited])

  const handleRegulationStatusChange = (value: RegulationStatus) => {
    setBasis((prev) => ({
      ...prev,
      regulationStatus: value,
      developmentStatus:
        value === 'Nachregelung' || value === 'Überführung' ? 'bereits im Wirkbetrieb' : prev.developmentStatus === 'bereits im Wirkbetrieb' ? 'in Vorbereitung' : prev.developmentStatus,
    }))
  }

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
          shortDescription: basis.shortDescription,
          regulationStatus: basis.regulationStatus,
          developmentStatus: basis.developmentStatus,
          replacingLegacy: basis.replacingLegacy,
          legacyPsi: basis.legacyPsi,
          legacyShortName: basis.legacyShortName,
          legacyNotes: basis.legacyNotes,
          aiPlanned: basis.aiPlanned,
          interfacesPlanned: basis.interfacesPlanned,
          systemProperty: basis.systemProperty,
          uiType: basis.uiType,
          tenantSeparation: basis.tenantSeparation,
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>PSI-Nummer*</span>
                  <InfoTooltip content="Systemname wird – sofern vorhanden – automatisch gefüllt." />
                </div>
                <Input
                  placeholder="PSI-Nummer"
                  value={basis.psi}
                  onChange={(e) => setBasis({ ...basis, psi: e.target.value })}
                />
              </div>
              <Input
                placeholder="Name Kurzbezeichnung"
                value={basis.shortName}
                onChange={(e) => {
                  setShortNameEdited(true)
                  setBasis({ ...basis, shortName: e.target.value })
                }}
              />
              <Input
                placeholder="Langbezeichnung"
                value={basis.longName}
                onChange={(e) => {
                  setLongNameEdited(true)
                  setBasis({ ...basis, longName: e.target.value })
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Select
                  value={basis.regulationStatus}
                  onChange={(e) => handleRegulationStatusChange(e.target.value as RegulationStatus)}
                >
                  <option value="Neu">Neu</option>
                  <option value="Nachregelung">Nachregelung</option>
                  <option value="Überführung">Überführung</option>
                </Select>
                <Select
                  value={basis.developmentStatus}
                  onChange={(e) => setBasis({ ...basis, developmentStatus: e.target.value as DevelopmentStatus })}
                >
                  <option value="in Vorbereitung">in Vorbereitung</option>
                  <option value="in Planung">in Planung</option>
                  <option value="in Pilotierung">in Pilotierung</option>
                  <option value="bereits im Wirkbetrieb">bereits im Wirkbetrieb</option>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="guided-legacy"
                      checked={basis.replacingLegacy}
                      onChange={() => setBasis({ ...basis, replacingLegacy: true })}
                    />
                    <span>Ablösung Altsystem: Ja</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name="guided-legacy"
                      checked={!basis.replacingLegacy}
                      onChange={() => setBasis({ ...basis, replacingLegacy: false })}
                    />
                    <span>Nein</span>
                  </label>
                </div>
                {basis.replacingLegacy && (
                  <div className="space-y-2">
                    <Input
                      placeholder="PSI-Nummer Altsystem"
                      value={basis.legacyPsi}
                      onChange={(e) => setBasis({ ...basis, legacyPsi: e.target.value })}
                    />
                    <Input
                      placeholder="Kurzbezeichnung Altsystem"
                      value={basis.legacyShortName}
                      onChange={(e) => {
                        setLegacyShortNameEdited(true)
                        setBasis({ ...basis, legacyShortName: e.target.value })
                      }}
                    />
                    <Textarea
                      placeholder="Weitere Anmerkungen zum Altsystem"
                      value={basis.legacyNotes}
                      onChange={(e) => setBasis({ ...basis, legacyNotes: e.target.value })}
                    />
                  </div>
                )}
              </div>
              <Textarea
                placeholder="Kurzbeschreibung"
                value={basis.shortDescription}
                onChange={(e) => setBasis({ ...basis, shortDescription: e.target.value })}
              />
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="guided-ai"
                    checked={basis.aiPlanned}
                    onChange={() => setBasis({ ...basis, aiPlanned: true })}
                  />
                  <span>KI geplant/vorhanden</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="guided-ai"
                    checked={!basis.aiPlanned}
                    onChange={() => setBasis({ ...basis, aiPlanned: false })}
                  />
                  <span>Keine KI</span>
                </label>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="guided-interfaces"
                    checked={basis.interfacesPlanned}
                    onChange={() => setBasis({ ...basis, interfacesPlanned: true })}
                  />
                  <span>Schnittstellen vorhanden</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    name="guided-interfaces"
                    checked={!basis.interfacesPlanned}
                    onChange={() => setBasis({ ...basis, interfacesPlanned: false })}
                  />
                  <span>Keine Schnittstellen</span>
                </label>
              </div>
              <Select
                value={basis.systemProperty}
                onChange={(e) => setBasis({ ...basis, systemProperty: e.target.value as SystemPropertyOption })}
              >
                <option value="datendrehscheibe">Datendrehscheibe / Middleware</option>
                <option value="ohneLogin">Ohne Login und Beschäftigtendaten</option>
                <option value="none">Keine der genannten Optionen</option>
              </Select>
              <Select
                value={basis.uiType}
                onChange={(e) => setBasis({ ...basis, uiType: e.target.value as UiTypeOption })}
              >
                <option value="gui">GUI (Web / Client / App)</option>
                <option value="admin">Administrative Oberfläche</option>
                <option value="terminal">Terminal / Command Line</option>
              </Select>
              <Select
                value={basis.tenantSeparation}
                onChange={(e) => setBasis({ ...basis, tenantSeparation: e.target.value as TenantSeparationOption })}
              >
                <option value="none">ohne Trennung</option>
                <option value="logical">logische Trennung</option>
                <option value="physical">physische Trennung</option>
              </Select>
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

