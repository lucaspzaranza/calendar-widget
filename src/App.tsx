import { useEffect, useState } from 'react'
import Calendar from './components/Calendar'
import EventPanel from './components/EventPanel'
import EventModal from './components/EventModal'
import { useEvents } from './hooks/useEvents'
import type { CalendarEvent } from './types'
import { enable, isEnabled } from '@tauri-apps/plugin-autostart'
import './App.css'

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const { addEvent, editEvent, deleteEvent, getEvents, hasEvents } = useEvents()
  const [showPanel, setShowPanel] = useState(false)

  function handleSave(data: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      editEvent(selectedDate, editingEvent.id, data)
    } else {
      addEvent(selectedDate, data)
    }
    setModalOpen(false)
    setEditingEvent(null)
  }
  
  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    setShowPanel(true)
  }

  useEffect(() => {
    isEnabled().then((enabled:boolean) => {
      if (!enabled) enable()
    })
  }, [])

  return (
    <div className="widget-container">
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        hasEvents={hasEvents}
      />
      {showPanel && (
        <EventPanel
          date={selectedDate}
          events={getEvents(selectedDate)}
          onAdd={() => { setEditingEvent(null); setModalOpen(true) }}
          onEdit={e => { setEditingEvent(e); setModalOpen(true) }}
          onDelete={id => deleteEvent(selectedDate, id)}
          onClose={() => setShowPanel(false)}
        />
      )}
      {modalOpen && (
        <EventModal
          initialData={editingEvent}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditingEvent(null) }}
        />
      )}
    </div>
  )
}