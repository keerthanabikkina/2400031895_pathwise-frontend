import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function AppointmentCalendar({ appointments, counselors }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1))

  // Map appointments to day numbers (mock based on existing appointments)
 const apptsByDay = {}

appointments.forEach((a) => {
  if (!a.date) return

  const apptDate = new Date(a.date)

  const apptYear = apptDate.getFullYear()
  const apptMonth = apptDate.getMonth()
  const apptDay = apptDate.getDate()

  // ✅ ONLY MATCH CURRENT MONTH
  if (apptYear === year && apptMonth === month) {

    if (!apptsByDay[apptDay]) {
      apptsByDay[apptDay] = []
    }

    apptsByDay[apptDay].push(a)
  }
})

  const selectedAppts = selectedDay ? (apptsByDay[selectedDay] || []) : []

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = new Date()
  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="card">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem' }}>📅 Appointment Calendar</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={prevMonth} style={s.navBtn}>←</button>
          <span style={{ fontWeight: '700', fontSize: '0.95rem', minWidth: '140px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} style={s.navBtn}>→</button>
        </div>
      </div>

      {/* Day names */}
      <div style={s.grid7}>
        {dayNames.map(d => (
          <div key={d} style={s.dayName}>{d}</div>
        ))}
      </div>

      {/* Calendar cells */}
      <div style={s.grid7}>
        {cells.map((day, i) => (
          <div key={i} onClick={() => day && setSelectedDay(day)}
            style={{
              ...s.cell,
              ...(day && isToday(day) ? s.todayCell : {}),
              ...(day && selectedDay === day ? s.selectedCell : {}),
              ...(day && apptsByDay[day] ? s.hasAppt : {}),
              ...(!day ? s.emptyCell : {}),
              cursor: day ? 'pointer' : 'default',
            }}>
            {day && (
              <>
                <span style={{ fontSize: '0.88rem', fontWeight: isToday(day) ? '700' : '400' }}>{day}</span>
                {apptsByDay[day] && (
                  <div style={s.apptDots}>
                    {apptsByDay[day].slice(0, 3).map((_, di) => (
                      <div key={di} style={s.dot} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {/* Selected day appointments */}
      {selectedDay && (
        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '12px' }}>
            {monthNames[month]} {selectedDay} — {selectedAppts.length} session{selectedAppts.length !== 1 ? 's' : ''}
          </h4>
          {selectedAppts.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0' }}>
              No sessions on this day.{' '}
              <Link to="/schedule" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Book one →</Link>
            </div>
          ) : selectedAppts.map((a, i) => (
            <div key={i} style={s.apptItem}>
              <div style={s.timeBox}>{a.time || '10:00 AM'}</div>
              <div>
                <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{a.counselorName}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{a.sessionType}</div>
              </div>
<span style={{
  marginLeft: 'auto',
  background:
    a.status === "accepted"
      ? "rgba(34,197,94,0.1)"
      : a.status === "rejected"
      ? "rgba(239,68,68,0.1)"
      : "rgba(245,158,11,0.1)",
  color:
    a.status === "accepted"
      ? "#22c55e"
      : a.status === "rejected"
      ? "#ef4444"
      : "#f59e0b",
  padding: "2px 8px",
  borderRadius: "10px",
  fontSize: "0.72rem",
  fontWeight: "600"
}}>
  {a.status}
</span>            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  navBtn: { background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-light)', borderRadius: '8px', color: 'var(--white)', padding: '6px 12px', cursor: 'pointer', fontSize: '0.9rem' },
  grid7: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '4px' },
  dayName: { textAlign: 'center', color: 'var(--muted)', fontSize: '0.72rem', fontWeight: '700', textTransform: 'uppercase', padding: '4px 0' },
  cell: { aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', transition: 'background 0.15s', padding: '2px' },
  emptyCell: { background: 'transparent' },
  todayCell: { background: 'rgba(29,78,216,0.2)', border: '1px solid var(--purple-light)', color: 'var(--purple-light)', fontWeight: '700' },
  selectedCell: { background: 'rgba(29,78,216,0.3)', border: '1px solid var(--purple-light)' },
  hasAppt: { background: 'rgba(245,158,11,0.08)' },
  apptDots: { display: 'flex', gap: '2px', marginTop: '2px' },
  dot: { width: '4px', height: '4px', borderRadius: '50%', background: '#f59e0b' },
  apptItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid var(--border-light)' },
  timeBox: { background: 'rgba(29,78,216,0.1)', border: '1px solid rgba(29,78,216,0.2)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.76rem', color: 'var(--purple-light)', fontWeight: '600', whiteSpace: 'nowrap' },
  pendingBadge: { marginLeft: 'auto', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', padding: '2px 8px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: '600' },
}
