import { useState } from 'react'
import { useNotifications } from '../context/NotificationContext'

export default function NotificationBell() {
  const { notifications, unread, markAllRead, clearAll } = useNotifications()
  const [open, setOpen] = useState(false)

  const toggle = () => { setOpen(!open); if (!open) markAllRead() }

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={toggle} style={s.bell}>
        🔔
        {unread > 0 && <span style={s.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div style={s.dropdown}>
          <div style={s.header}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
            <button onClick={clearAll} style={s.clearBtn}>Clear all</button>
          </div>
          {notifications.length === 0
            ? <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No notifications yet</div>
            : notifications.map(n => (
              <div key={n.id} style={s.item}>
                <span style={{ fontSize: '1rem' }}>
                  {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : '🔔'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.83rem', color: 'var(--white)', lineHeight: '1.4' }}>{n.message}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>{new Date(n.createdAt).toLocaleTimeString()}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

const s = {
  bell: { position: 'relative', background: 'rgba(167, 16, 197, 0.89)', border: '1px solid rgba(255, 255, 255, 0.85)', borderRadius: '10px', padding: '8px 10px', cursor: 'pointer', fontSize: '1rem' },
  badge: { position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: '700' },
  dropdown: { position: 'absolute', right: 0, top: '44px', width: '300px', background: '#d7dadd', border: '1px solid rgba(29,78,216,0.3)', borderRadius: '14px', boxShadow: '0 16px 40px rgba(0,0,0,0.4)', zIndex: 3000, maxHeight: '360px', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border-light)' },
  clearBtn: { background: 'none', border: 'none', color: 'var(--muted)', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' },
  item: { display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' },
}
