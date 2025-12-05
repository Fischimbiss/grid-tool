import React, { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AiFormData, aiSchema } from './schema'
import { Card, CardContent } from './components/ui/card'
import { RichTextarea } from './components/ui/rich-textarea'
import { Checkbox } from './components/ui/checkbox'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'

interface Props {
  lastSnapshot?: Partial<AiFormData>
  onCreateCR?: (tasks: string[]) => void
  canEdit?: boolean
}

const defaultValues: AiFormData = {
  description: '',
  processImpact: '',
  employeeDataProcessed: false,
  employeeDataDetails: '',
  modelDescription: '',
  autonomyAssessment: '',
  corporateRisk: 'low',
  corporateRiskJustification: '',
  aiActRisk: 'low',
  worksCouncilInformed: false,
  worksCouncilFile: undefined,
  reminderDaysBeforeWba: 30,
}

const riskOptions = [
  { value: 'low', label: 'niedriges Risiko' },
  { value: 'medium', label: 'mittleres Risiko' },
  { value: 'high', label: 'hohes Risiko' },
]

export const AITab: React.FC<Props> = ({ lastSnapshot, onCreateCR, canEdit = true }) => {
  const form = useForm<AiFormData>({ resolver: zodResolver(aiSchema), defaultValues })
  const { control, handleSubmit, watch, register, reset, formState } = form
  const employeeDataProcessed = watch('employeeDataProcessed')
  const worksCouncilInformed = watch('worksCouncilInformed')

  useEffect(() => {
    if (lastSnapshot) {
      reset({ ...defaultValues, ...lastSnapshot })
    }
  }, [lastSnapshot, reset])

  const onSubmit = (data: AiFormData) => {
    onCreateCR?.([])
    // Form submission is currently a client-side interaction only.
    console.debug('AI tab saved', data)
  }

  const errorMessage = (path: keyof typeof formState.errors) => {
    const message = formState.errors[path]?.message as string | undefined
    return message ? <p className="text-sm text-red-600">{message}</p> : null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <fieldset disabled={!canEdit} className="space-y-6">
        <Card>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">KI</h2>
              <p className="text-sm text-neutral-600">Enthaltene Datenfelder</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="font-medium" htmlFor="description">
                  Beschreibung
                </label>
                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => (
                    <RichTextarea
                      id="description"
                      toolbar
                      placeholder="Was macht diese KI?"
                      disabled={!canEdit}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errorMessage('description')}
              </div>

              <div className="space-y-2">
                <label className="font-medium" htmlFor="processImpact">
                  Auswirkungen auf die Prozesse
                </label>
                <Controller
                  name="processImpact"
                  control={control}
                  render={({ field }) => (
                    <RichTextarea
                      id="processImpact"
                      toolbar
                      placeholder="Wie verändern sich Abläufe und Zuständigkeiten?"
                      disabled={!canEdit}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errorMessage('processImpact')}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <Controller
                  name="employeeDataProcessed"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-start gap-2 text-sm font-medium">
                      <Checkbox
                        id="employeeDataProcessed"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(!!checked)}
                      />
                      <span>Werden Beschäftigtendaten durch die KI verarbeitet?</span>
                    </label>
                  )}
                />
                {employeeDataProcessed && (
                  <div className="space-y-2 pl-6">
                    <label className="font-medium" htmlFor="employeeDataDetails">
                      Wenn ja: Welche Beschäftigtendaten und zu welchem Zweck?
                    </label>
                    <Controller
                      name="employeeDataDetails"
                      control={control}
                      render={({ field }) => (
                        <RichTextarea
                          id="employeeDataDetails"
                          toolbar
                          placeholder="Beschreibe die betroffenen Datenkategorien und Zwecke."
                          disabled={!canEdit}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    {errorMessage('employeeDataDetails')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-medium" htmlFor="modelDescription">
                  Modell der KI
                </label>
                <Controller
                  name="modelDescription"
                  control={control}
                  render={({ field }) => (
                    <RichTextarea
                      id="modelDescription"
                      toolbar
                      placeholder="Beispiele: Sprachmodell - LLM, Bilderkennungsmodell, Generatives Modell ..."
                      disabled={!canEdit}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <p className="text-xs text-neutral-600">
                  Modellname oder Typ, z. B. Meta Llama 3.3 70b-instruct AWQ, Mistral Small 3 oder jina-embeddings-v2-base-de.
                </p>
                {errorMessage('modelDescription')}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-medium" htmlFor="autonomyAssessment">
                In welchem Umfang kann die KI (teil)autonome Schlussfolgerungen ziehen?
              </label>
              <p className="text-sm text-neutral-600">
                KI-Autonomie beschreibt, wie eigenständig ein System Aufgaben erledigt und Entscheidungen trifft – von regelbasierten
                Programmen bis hin zu lernenden Agenten.
              </p>
              <Controller
                name="autonomyAssessment"
                control={control}
                render={({ field }) => (
                  <RichTextarea
                    id="autonomyAssessment"
                    toolbar
                    placeholder="Beschreibe den Grad der Autonomie und den Bedarf an menschlicher Aufsicht."
                    disabled={!canEdit}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errorMessage('autonomyAssessment')}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Betriebliche Risikoklassifizierung</label>
                  <span className="text-xs text-neutral-600">(Anlage 3 KBV IT Systeme)</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {riskOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value={option.value}
                        className="h-4 w-4"
                        {...register('corporateRisk')}
                        disabled={!canEdit}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errorMessage('corporateRisk')}

                <label className="font-medium" htmlFor="corporateRiskJustification">
                  Begründung
                </label>
                <Controller
                  name="corporateRiskJustification"
                  control={control}
                  render={({ field }) => (
                    <RichTextarea
                      id="corporateRiskJustification"
                      toolbar
                      placeholder="Warum wird diese Einstufung vorgenommen?"
                      disabled={!canEdit}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errorMessage('corporateRiskJustification')}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-medium">Risikoklassifizierung der KI-Verordnung</label>
                  <span className="text-xs text-neutral-600">(Ergebnis aus dem DEA-Verfahren)</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {riskOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value={option.value}
                        className="h-4 w-4"
                        {...register('aiActRisk')}
                        disabled={!canEdit}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {errorMessage('aiActRisk')}

                <div className="space-y-3 pt-2">
                  <Controller
                    name="worksCouncilInformed"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-start gap-2 text-sm font-medium">
                        <Checkbox
                          id="worksCouncilInformed"
                          checked={field.value}
                          onCheckedChange={(checked) => field.onChange(!!checked)}
                        />
                        <span>Wurde dem Betriebsrat das Ergebnis des DEA-Verfahrens zur Verfügung gestellt?</span>
                      </label>
                    )}
                  />

                  {worksCouncilInformed ? (
                    <div className="space-y-2 pl-6">
                      <label className="font-medium" htmlFor="worksCouncilFile">
                        Wenn ja: Uploadmöglichkeit
                      </label>
                      <Controller
                        name="worksCouncilFile"
                        control={control}
                        render={({ field }) => (
                          <Input
                            id="worksCouncilFile"
                            type="file"
                            disabled={!canEdit}
                            onChange={(e) => field.onChange(e.target.files?.[0])}
                          />
                        )}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2 pl-6">
                      <label className="font-medium" htmlFor="reminderDaysBeforeWba">
                        Wenn nein: Automatische Erinnerung X Tage vor dem geplanten WBA
                      </label>
                      <Input
                        id="reminderDaysBeforeWba"
                        type="number"
                        min={1}
                        disabled={!canEdit}
                        {...register('reminderDaysBeforeWba', { valueAsNumber: true })}
                      />
                      {errorMessage('reminderDaysBeforeWba')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit">Speichern</Button>
        </div>
      </fieldset>
    </form>
  )
}

export default AITab
