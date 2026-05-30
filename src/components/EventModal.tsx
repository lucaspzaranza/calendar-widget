import { useState } from 'react'
import type { CalendarEvent } from '../types'

interface Props {
  initialData: CalendarEvent | null
  onSave: (data: Omit<CalendarEvent, 'id'>) => void
  onClose: () => void
}

export default function EventModal({ initialData, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [time, setTime] = useState(initialData?.time ?? '09:00')
  const [color, setColor] = useState<CalendarEvent['color']>(initialData?.color ?? 'purple')
  const [note, setNote] = useState(initialData?.note ?? '')

  function handleSave() {
    if (!title.trim()) return
    onSave({ title: title.trim(), time, color, note })
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      borderRadius: 20, zIndex: 50,
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#1e1b4b',
        border: '1px solid rgba(139,92,246,0.4)',
        borderRadius: 16, padding: 20, width: 232
      }}>
        <h4 style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
          {initialData ? 'Editar evento' : 'Novo evento'}
        </h4>

        {[
          { label: 'Título', el: <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nome do evento" style={inputStyle} autoFocus onKeyDown={e => e.key === 'Enter' && handleSave()} /> },
          { label: 'Horário', el: <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} /> },
          { label: 'Cor', el: (
            <select value={color} onChange={e => setColor(e.target.value as CalendarEvent['color'])} style={inputStyle}>
              <option value="purple">Roxo</option>
              <option value="blue">Azul</option>
              <option value="green">Verde</option>
              <option value="amber">Âmbar</option>
              <option value="rose">Rosa</option>
            </select>
          )},
          { label: 'Nota', el: <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'none' }} /> }
        ].map(({ label, el }) => (
          <div key={label} style={{ marginBottom: 10 }}>
            <label style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, display: 'block', marginBottom: 4 }}>{label}</label>
            {el}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button onClick={onClose} style={cancelBtn}>Cancelar</button>
          <button onClick={handleSave} style={saveBtn}>Salvar</button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  borderRadius: 8, color: '#e2e8f0', fontSize: 12,
  padding: '7px 10px', outline: 'none', fontFamily: 'inherit'
}
const saveBtn: React.CSSProperties = {
  flex: 1, background: 'rgba(139,92,246,0.45)',
  border: '1px solid rgba(139,92,246,0.7)',
  color: '#c4b5fd', fontSize: 12, padding: 8,
  borderRadius: 8, cursor: 'pointer', fontWeight: 500
}
const cancelBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.5)', fontSize: 12,
  padding: '8px 12px', borderRadius: 8, cursor: 'pointer'
}