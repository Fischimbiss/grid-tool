export interface System {
  id: number
  shortName: string
  longName: string
  group: string
  createdBy: string
  fso: string
  categories: {
    basis: { psi: string; appId: string; shortDescription: string }
    system: { type: string; technology: string }
    interfaces: string[]
    roles: string[]
    reports: string[]
    privacy: { personalData: boolean }
    ai: { ai_present: boolean; risk: string }
  }
}

export const systems: System[] = [
  {
    id: 1,
    shortName: 'RecruitPro',
    longName: 'Recruitment Tracking System',
    group: 'HR',
    createdBy: 'Max Mustermann',
    fso: 'Max Mustermann',
    categories: {
      basis: { psi: 'PSI-001', appId: 'APP-1001', shortDescription: 'Verwaltet Bewerbungsprozesse' },
      system: { type: 'Web', technology: 'React' },
      interfaces: ['SAP HR'],
      roles: ['Recruiter'],
      reports: ['Monatliche Auswertung'],
      privacy: { personalData: true },
      ai: { ai_present: false, risk: 'low' },
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
      basis: { psi: 'PSI-002', appId: 'APP-1002', shortDescription: 'CRM für den Vertrieb' },
      system: { type: 'Web', technology: 'Angular' },
      interfaces: ['SAP SD', 'MailChimp'],
      roles: ['Sales Agent', 'Manager'],
      reports: ['Quartalsumsätze', 'Forecast'],
      privacy: { personalData: true },
      ai: { ai_present: true, risk: 'medium' },
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
      basis: { psi: 'PSI-003', appId: 'APP-1003', shortDescription: 'Analysen für Management' },
      system: { type: 'Web', technology: 'Vue' },
      interfaces: ['Data Warehouse'],
      roles: ['Analyst'],
      reports: ['Tägliche Insights'],
      privacy: { personalData: false },
      ai: { ai_present: true, risk: 'high' },
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
      basis: { psi: 'PSI-004', appId: 'APP-1004', shortDescription: 'Kundenanfragen verwalten' },
      system: { type: 'Web', technology: 'Laravel' },
      interfaces: ['E-Mail', 'SMS Gateway'],
      roles: ['Support Agent'],
      reports: ['Wöchentliche Tickets'],
      privacy: { personalData: true },
      ai: { ai_present: false, risk: 'low' },
    },
  },
]
