import { useState } from 'react'
import type { CalendarEvent } from '../types'
// import { Window } from '@tauri-apps/api/window'
import { invoke } from '@tauri-apps/api/core'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const DAYS = ['D','S','T','Q','Q','S','S']

const COLOR_MAP = {
  purple: '#a78bfa', blue: '#60a5fa',
  green: '#34d399', amber: '#fbbf24', rose: '#fb7185'
}

interface Props {
  selectedDate: Date
  onSelectDate: (d: Date) => void
  hasEvents: (d: Date) => CalendarEvent[]
}

export default function Calendar({ selectedDate, onSelectDate, hasEvents }: Props) {
  const today = new Date()
  const [cursor, setCursor] = useState({ y: today.getFullYear(), m: today.getMonth() })
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const first = new Date(cursor.y, cursor.m, 1)
  const last = new Date(cursor.y, cursor.m + 1, 0)
  const prevPad = first.getDay()

  const cells: { date: Date; other: boolean }[] = []

  for (let i = prevPad - 1; i >= 0; i--) {
    cells.push({ date: new Date(cursor.y, cursor.m, -i), other: true })
  }
  for (let i = 1; i <= last.getDate(); i++) {
    cells.push({ date: new Date(cursor.y, cursor.m, i), other: false })
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(cursor.y, cursor.m + 1, cells.length - last.getDate() - prevPad + 1), other: true })
  }

  function changeMonth(delta: number) {
    setCursor(prev => {
      let m = prev.m + delta
      let y = prev.y
      if (m < 0) { m = 11; y-- }
      if (m > 11) { m = 0; y++ }
      return { y, m }
    })
  }

  const isToday = (d: Date) => d.toDateString() === today.toDateString()
  const isSel = (d: Date) => d.toDateString() === selectedDate.toDateString()

  return (
    <div className="glass-panel" style={{ width: 256, padding: '18px 16px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => changeMonth(-1)} style={navBtn}>‹</button>
        <span style={{ color: '#fff', fontWeight: 500, letterSpacing: '.4px' }}>
          {MONTHS[cursor.m]} {cursor.y}
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => changeMonth(1)} style={navBtn}>›</button>
          <button onClick={() => {
              console.log('fechando...')
              // Window.getCurrent().close()
              invoke('close_app')
            }} style={{ ...navBtn, fontSize: 'inherit', color: 'rgba(255,255,255,0.4)' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* day-of-week header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 6 }}>
        {DAYS.map(d => (
          <span key={d} style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontWeight: 600 }}>{d}</span>
        ))}
      </div>

      {/* day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
        {cells.map(({ date, other }, idx) => {
          const evs = other ? [] : hasEvents(date)
          const dots = evs.slice(0, 3)
          const isHovered = hoveredDate === date.toDateString()

          return (
            <div
              key={idx}
              onClick={() => !other && onSelectDate(date)}
              onMouseEnter={() => !other && evs.length > 0 && setHoveredDate(date.toDateString())}
              onMouseLeave={() => setHoveredDate(null)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'flex-start', gap: 2,
                padding: '5px 2px', borderRadius: 8, cursor: other ? 'default' : 'pointer',
                minHeight: 34,
                position: 'relative',
                background: isToday(date)
                  ? 'rgba(139,92,246,0.45)'
                  : isSel(date) && !other
                    ? 'rgba(255,255,255,0.12)'
                    : 'transparent',
                border: isToday(date)
                  ? '1px solid rgba(139,92,246,0.8)'
                  : isSel(date) && !other
                    ? '1px solid rgba(255,255,255,0.25)'
                    : '1px solid transparent',
                transition: 'background .15s'
              }}
            >
              <span style={{
                fontWeight: isToday(date) ? 800 : 600,
                color: other ? 'rgba(255,255,255,0.2)' : isToday(date) ? '#fff' : 'rgba(255,255,255,0.75)'
              }}>
                {date.getDate()}
              </span>

              {dots.length > 0 && (
                <div style={{ display: 'flex', gap: 2 }}>
                  {dots.map((e, i) => (
                    <span key={i} style={{
                      width: 3, height: 3, borderRadius: '50%',
                      background: COLOR_MAP[e.color] ?? '#a78bfa'
                    }} />
                  ))}
                </div>
              )}

              {/* popup hover */}
              {isHovered && (
                <div style={{
                  position: 'absolute',
                  bottom: '110%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(20, 16, 50, 0.95)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 10,
                  padding: '8px 10px',
                  zIndex: 100,
                  minWidth: 150,
                  pointerEvents: 'none',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)'
                }}>
                  {evs.map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      marginBottom: i < evs.length - 1 ? 5 : 0
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: COLOR_MAP[e.color], flexShrink: 0
                      }} />
                      <span style={{ color: '#e2e8f0', fontSize: 11, whiteSpace: 'nowrap' }}>
                        {e.time} — {e.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const navBtn: React.CSSProperties = {
  fontWeight: 'bold',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.15)',
  color: '#e2e8f0', width: 26, height: 26,
  borderRadius: 7, cursor: 'pointer', fontSize: 20,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
}