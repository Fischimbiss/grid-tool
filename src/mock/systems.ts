import type { AiFormData } from '../schema'

export type BasisMatrixEntry = {
  active: boolean
  data: boolean
  activeCount: number
  dataCount: number
}

export type RegulationStatus = 'Neu' | 'Nachregelung' | 'Überführung'
export type DevelopmentStatus =
  | 'in Vorbereitung'
  | 'in Planung'
  | 'in Pilotierung'
  | 'bereits im Wirkbetrieb'
export type SystemPropertyOption =
  | 'datendrehscheibe'
  | 'ohneLogin'
  | 'none'
export type UiTypeOption = 'gui' | 'admin' | 'terminal'
export type TenantSeparationOption = 'none' | 'logical' | 'physical'

export type BasisCategory = {
  psi: string
  shortDescription: string
  regulationStatus: RegulationStatus
  developmentStatus: DevelopmentStatus
  replacingLegacy: boolean
  legacyPsi: string
  legacyShortName: string
  legacyNotes: string
  aiPlanned: boolean
  interfacesPlanned: boolean
  systemProperty: SystemPropertyOption
  uiType: UiTypeOption
  tenantSeparation: TenantSeparationOption
  matrix: Record<string, BasisMatrixEntry>
}

export type SystemRole = {
  id: number
  number: string
  systemName: string
  shopName: string
  userName: string
  tasks: string[]
  permissions: string[]
}

export interface System {
  id: number
  shortName: string
  longName: string
  group: string
  createdBy: string
  fso: string
  categories: {
    basis: BasisCategory
    system: { type: string; technology: string }
    interfaces: string[]
    roles: SystemRole[]
    reports: string[]
    privacy: { personalData: boolean }
    ai: Partial<AiFormData>
  }
}

const makeMatrix = (): Record<string, BasisMatrixEntry> => ({
  DTAG: { active: true, data: true, activeCount: 5000, dataCount: 4000 },
  DTIT: { active: true, data: false, activeCount: 200, dataCount: 0 },
})

const sampleRoles: SystemRole[] = [
  {
    id: 1,
    number: 'TA 1',
    systemName: 'Recruiter',
    shopName: 'SKM-DC-Recruiter',
    userName: 'Recruiter',
    tasks: ['Stellen anlegen', 'Bewerbungen sichten'],
    permissions: ['Stellenausschreibungen', 'Kandidatendaten'],
  },
]

export const systems: System[] = [
  {
    id: 1,
    shortName: 'RecruitPro',
    longName: 'Recruitment Tracking System',
    group: 'HR',
    createdBy: 'Max Mustermann',
    fso: 'Max Mustermann',
    categories: {
      basis: {
        psi: 'PSI-001',
        shortDescription: 'Verwaltet Bewerbungsprozesse',
        regulationStatus: 'Überführung',
        developmentStatus: 'bereits im Wirkbetrieb',
        replacingLegacy: false,
        legacyPsi: '',
        legacyShortName: '',
        legacyNotes: '',
        aiPlanned: true,
        interfacesPlanned: true,
        systemProperty: 'none',
        uiType: 'gui',
        tenantSeparation: 'logical',
        matrix: makeMatrix(),
      },
      system: { type: 'Web', technology: 'React' },
      interfaces: ['SAP HR'],
      roles: sampleRoles,
      reports: ['Monatliche Auswertung'],
      privacy: { personalData: true },
      ai: {
        ai_present: false,
        purpose: 'Unterstützung bei der Kandidatensuche',
        risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'HR Support' },
        dea: { completed: true, date: '2024-01-01' },
        monitoring: { metrics: ['accuracy'], eval_cadence: 'monatlich' },
      },
    },
  },
  {
    id: 2,
    shortName: 'SalesHub',
    longName: 'Sales Dashboard',
    group: 'Sales',
    createdBy: 'Anna Beispiel',
    fso: 'Max Mustermann',
    categories: {
      basis: {
        psi: 'PSI-002',
        shortDescription: 'CRM für den Vertrieb',
        regulationStatus: 'Überführung',
        developmentStatus: 'bereits im Wirkbetrieb',
        replacingLegacy: true,
        legacyPsi: 'PSI-998',
        legacyShortName: 'LegacyCRM',
        legacyNotes: 'Altsystem läuft parallel bis Q4.',
        aiPlanned: true,
        interfacesPlanned: true,
        systemProperty: 'datendrehscheibe',
        uiType: 'gui',
        tenantSeparation: 'logical',
        matrix: makeMatrix(),
      },
      system: { type: 'Web', technology: 'Angular' },
      interfaces: ['SAP SD', 'MailChimp'],
      roles: sampleRoles,
      reports: ['Quartalsumsätze', 'Forecast'],
      privacy: { personalData: true },
      ai: {
        ai_present: true,
        purpose: 'Verkaufsprognosen',
        risk: { eu_ai_act: 'limited', corp_class: 'medium', justification: 'CRM' },
        dea: { completed: true, date: '2024-02-01' },
        monitoring: { metrics: ['accuracy', 'fairness'], eval_cadence: 'quartal' },
      },
    },
  },
  {
    id: 3,
    shortName: 'InsightBoard',
    longName: 'Analytics Board',
    group: 'Sales',
    createdBy: 'Sara Team',
    fso: 'Sara Team',
    categories: {
      basis: {
        psi: 'PSI-003',
        shortDescription: 'Analysen für Management',
        regulationStatus: 'Nachregelung',
        developmentStatus: 'bereits im Wirkbetrieb',
        replacingLegacy: false,
        legacyPsi: '',
        legacyShortName: '',
        legacyNotes: '',
        aiPlanned: true,
        interfacesPlanned: true,
        systemProperty: 'none',
        uiType: 'gui',
        tenantSeparation: 'logical',
        matrix: makeMatrix(),
      },
      system: { type: 'Web', technology: 'Vue' },
      interfaces: ['Data Warehouse'],
      roles: sampleRoles,
      reports: ['Tägliche Insights'],
      privacy: { personalData: false },
      ai: {
        ai_present: true,
        purpose: 'Trendanalysen',
        risk: { eu_ai_act: 'high', corp_class: 'high', justification: 'Entscheidungsunterstützung' },
        dea: { completed: true, date: '2024-03-01' },
        monitoring: { metrics: ['accuracy', 'fairness', 'drift'], eval_cadence: 'wöchentlich' },
      },
    },
  },
  {
    id: 4,
    shortName: 'SupportOne',
    longName: 'Customer Support Portal',
    group: 'Support',
    createdBy: 'Tom Ticket',
    fso: 'Tom Ticket',
    categories: {
      basis: {
        psi: 'PSI-004',
        shortDescription: 'Kundenanfragen verwalten',
        regulationStatus: 'Neu',
        developmentStatus: 'in Pilotierung',
        replacingLegacy: false,
        legacyPsi: '',
        legacyShortName: '',
        legacyNotes: '',
        aiPlanned: false,
        interfacesPlanned: true,
        systemProperty: 'none',
        uiType: 'gui',
        tenantSeparation: 'none',
        matrix: makeMatrix(),
      },
      system: { type: 'Web', technology: 'Laravel' },
      interfaces: ['E-Mail', 'SMS Gateway'],
      roles: sampleRoles,
      reports: ['Wöchentliche Tickets'],
      privacy: { personalData: true },
      ai: {
        ai_present: false,
        purpose: 'Antwortvorschläge',
        risk: { eu_ai_act: 'minimal', corp_class: 'low', justification: 'Support' },
        dea: { completed: true, date: '2024-04-01' },
        monitoring: { metrics: ['accuracy'], eval_cadence: 'monatlich' },
      },
    },
  },
]
