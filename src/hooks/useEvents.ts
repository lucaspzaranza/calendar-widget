import { useState, useEffect } from 'react'
import type { EventMap, CalendarEvent } from '../types'

const STORAGE_KEY = 'calendar-widget-events'

function dateKey(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function useEvents() {
  const [events, setEvents] = useState<EventMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  }, [events])

  function addEvent(date: Date, event: Omit<CalendarEvent, 'id'>) {
    const key = dateKey(date)
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID()
    }
    setEvents(prev => {
      const existing = prev[key] ?? []
      const updated = [...existing, newEvent]
        .sort((a, b) => a.time.localeCompare(b.time))
      return { ...prev, [key]: updated }
    })
  }

  function editEvent(date: Date, id: string, data: Partial<CalendarEvent>) {
    const key = dateKey(date)
    setEvents(prev => ({
      ...prev,
      [key]: (prev[key] ?? []).map(e => e.id === id ? { ...e, ...data } : e)
    }))
  }

  function deleteEvent(date: Date, id: string) {
    const key = dateKey(date)
    setEvents(prev => {
      const filtered = (prev[key] ?? []).filter(e => e.id !== id)
      const next = { ...prev }
      if (filtered.length === 0) delete next[key]
      else next[key] = filtered
      return next
    })
  }

  function getEvents(date: Date): CalendarEvent[] {
    return events[dateKey(date)] ?? []
  }

  function hasEvents(date: Date): CalendarEvent[] {
    return events[dateKey(date)] ?? []
  }

  return { events, addEvent, editEvent, deleteEvent, getEvents, hasEvents }
}