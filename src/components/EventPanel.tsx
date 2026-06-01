import type { CalendarEvent } from '../types'

const MONTHS_SHORT = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

const COLOR_MAP: Record<string, string> = {
  purple: '#a78bfa', blue: '#60a5fa',
  green: '#34d399', amber: '#fbbf24', rose: '#fb7185'
}

interface Props {
  date: Date
  events: CalendarEvent[]
  onAdd: () => void
  onEdit: (e: CalendarEvent) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function EventPanel({ date, events, onAdd, onEdit, onDelete, onClose }: Props) {
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  const label = isToday ? 'Hoje' : `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]}`

  return (
    <div className="glass-panel" style={{ WebkitAppRegion: 'no-drag' as any, width: 256, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#e2e8f0', fontWeight: 'bold' }}>{label}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onAdd} style={addBtnStyle}>+ Evento</button>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
      </div>

      {events.length === 0 ? (
        <span style={{ color: 'rgba(255,255,255,0.25)', textAlign: 'center', paddingTop: 20 }}>
          Nenhum evento
        </span>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, overflowY: 'auto', maxHeight: 280, WebkitAppRegion: 'no-drag' as any }}>
          {events.map(e => (
            <div key={e.id} className="event-card" style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12, padding: '9px 10px',
              display: 'flex', gap: 9, alignItems: 'flex-start',
              cursor: 'pointer', marginRight: '10px'
            }}>
              <div style={{
                width: 5, borderRadius: 2, alignSelf: 'stretch',
                background: COLOR_MAP[e.color] ?? '#a78bfa', flexShrink: 0
              }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f1f5f9', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {e.title}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: 'bold' }}>
                  {e.time}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                <button onClick={() => onEdit(e)} style={iconBtn} title="Editar">✎</button>
                <button onClick={() => onDelete(e.id)} style={iconBtn} title="Excluir">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const iconBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: 'none', color: 'rgba(255,255,255,0.5)',
  width: 22, height: 22, borderRadius: 6,
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}

const addBtnStyle: React.CSSProperties = {
  fontWeight: 'bold',
  background: 'rgba(139,92,246,0.3)',
  border: '1px solid rgba(139,92,246,0.5)',
  color: '#c4b5fd', padding: '4px 10px',
  borderRadius: 8, cursor: 'pointer'
}

const closeBtnStyle: React.CSSProperties = {
  fontWeight: 'bold',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'rgba(255,255,255,0.5)',
  width: 24, height: 24, borderRadius: 8,
  cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center'
}