import { aiSchema } from './schema'

describe('aiSchema validation', () => {
  const base = {
    description: 'Test KI',
    processImpact: 'Keine direkten Auswirkungen',
    employeeDataProcessed: false,
    employeeDataDetails: '',
    modelDescription: 'Sprachmodell',
    autonomyAssessment: 'Nur unterstützend',
    corporateRisk: 'low' as const,
    corporateRiskJustification: 'Geringe Tragweite',
    aiActRisk: 'low' as const,
    worksCouncilInformed: true,
    worksCouncilFile: undefined,
    reminderDaysBeforeWba: 10,
  }

  it('requires employee data details when processed', () => {
    const res = aiSchema.safeParse({
      ...base,
      employeeDataProcessed: true,
      employeeDataDetails: '',
    })
    expect(res.success).toBe(false)
  })

  it('requires reminder when works council not informed', () => {
    const res = aiSchema.safeParse({
      ...base,
      worksCouncilInformed: false,
      reminderDaysBeforeWba: undefined,
    })
    expect(res.success).toBe(false)
  })

  it('accepts a fully populated payload', () => {
    const res = aiSchema.safeParse({
      ...base,
      employeeDataProcessed: true,
      employeeDataDetails: 'Mitarbeiter-IDs für Abgleich mit Rollenprofilen.',
      worksCouncilInformed: false,
      reminderDaysBeforeWba: 30,
    })
    expect(res.success).toBe(true)
  })
})
