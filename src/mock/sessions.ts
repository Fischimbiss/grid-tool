export interface Session {
  id: number
  date: string // ISO date
  agenda: string[]
}

export const sessions: Session[] = [
  {
    id: 1,
    date: '2024-09-01',
    agenda: ['Vorstellung SalesHub', 'Budgetplanung']
  }
]
