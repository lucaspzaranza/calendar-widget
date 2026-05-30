import { useState } from 'react'
import Calendar from './components/Calendar'
import EventPanel from './components/EventPanel'
import EventModal from './components/EventModal'
import { useEvents } from './hooks/useEvents'
import type { CalendarEvent } from './types'
import './App.css'

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const { events, addEvent, editEvent, deleteEvent, getEvents, hasEvents } = useEvents()

  function handleSave(data: Omit<CalendarEvent, 'id'>) {
    if (editingEvent) {
      editEvent(selectedDate, editingEvent.id, data)
    } else {
      addEvent(selectedDate, data)
    }
    setModalOpen(false)
    setEditingEvent(null)
  }

  function handleEdit(event: CalendarEvent) {
    setEditingEvent(event)
    setModalOpen(true)
  }

  function handleNewEvent() {
    setEditingEvent(null)
    setModalOpen(true)
  }

  return (
    <div className="widget-container">
      <Calendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        hasEvents={hasEvents}
      />
      <EventPanel
        date={selectedDate}
        events={getEvents(selectedDate)}
        onAdd={handleNewEvent}
        onEdit={handleEdit}
        onDelete={(id) => deleteEvent(selectedDate, id)}
      />
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