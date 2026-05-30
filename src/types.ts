export interface CalendarEvent {
  id: string
  title: string
  time: string
  color: 'purple' | 'blue' | 'green' | 'amber' | 'rose'
  note?: string
}

export type EventMap = Record<string, CalendarEvent[]>
// chave: "YYYY-MM-DD"