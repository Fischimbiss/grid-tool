import { AiFormData } from '../schema'

export const lowRisk: AiFormData = {
  description: 'Assistent zur Textzusammenfassung für interne Richtlinien.',
  processImpact: 'Beschleunigt die Dokumentenprüfung ohne Änderung von Verantwortlichkeiten.',
  employeeDataProcessed: false,
  employeeDataDetails: '',
  modelDescription: 'Sprachmodell - LLM (On-Premise, feinjustiert für interne Richtlinien).',
  autonomyAssessment: 'Gibt Vorschläge, die immer durch Mitarbeitende freigegeben werden müssen.',
  corporateRisk: 'low',
  corporateRiskJustification: 'Nur unterstützende Nutzung ohne Eingriff in Entscheidungen.',
  aiActRisk: 'low',
  worksCouncilInformed: true,
  worksCouncilFile: undefined,
  reminderDaysBeforeWba: undefined,
}

export const mediumRisk: AiFormData = {
  ...lowRisk,
  employeeDataProcessed: true,
  employeeDataDetails: 'Nutzungsdaten zur Personalisierung der Vorschläge.',
  corporateRisk: 'medium',
  corporateRiskJustification: 'Teilautomatisierte Vorschläge mit möglicher Einflussnahme auf Arbeitslast.',
  aiActRisk: 'medium',
}

export const highRisk: AiFormData = {
  ...mediumRisk,
  corporateRisk: 'high',
  corporateRiskJustification: 'Ergebnisse beeinflussen direkte Entscheidungen im HR-Kontext.',
  aiActRisk: 'high',
}
