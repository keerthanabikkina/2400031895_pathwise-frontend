import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const specializations = ['All', 'Technology', 'Business', 'Healthcare', 'Creative Arts']

export default function Counselors({ counselors, auth }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [resumeView, setResumeView] = useState(false)
  const [slotsMap, setSlotsMap] = useState({})

  const filtered = counselors.filter(c => filter === 'All' || c.specialization === filter)

  const loadSlots = async (counselorId) => {
  if (slotsMap[counselorId]) return

  try {
    const res = await fetch(`http://localhost:8081/api/slots/${counselorId}`)

    if (!res.ok) {
      console.error("❌ Failed to fetch slots:", res.status)
      setSlotsMap(prev => ({
        ...prev,
        [counselorId]: [] // avoid infinite loading
      }))
      return
    }

    const data = await res.json()

    setSlotsMap(prev => ({
      ...prev,
      [counselorId]: data
    }))
  } catch (err) {
    console.error("❌ Error loading slots:", err)
    setSlotsMap(prev => ({
      ...prev,
      [counselorId]: []
    }))
  }
}


useEffect(() => {
  filtered.forEach(c => loadSlots(c.id))
}, [filtered])


  const handleBook = () => {
    if (!auth?.role) {
      navigate('/login', { state: { from: '/schedule' } })
    } else {
      navigate('/schedule')
    }
    setSelected(null)
  }
const modalSlots = selected ? (slotsMap[selected.id] || []) : []
  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" />

      <div style={{ background: 'rgba(17,34,64,0.4)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container">
          <p style={s.eyebrow}>OUR EXPERTS</p>
          <h1 className="section-title">Meet Your Career Counselors</h1>
          <p className="section-subtitle">All sessions are free. View counselor profiles, ratings & resumes before booking.</p>
          <div style={s.tabRow}>
            {specializations.map(sp => (
              <button key={sp} onClick={() => setFilter(sp)} style={{ ...s.tab, ...(filter === sp ? s.tabActive : {}) }}>{sp}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <div className="grid-3">
          {filtered.map(c => {
  const slots = slotsMap[c.id] || []

  return (
    <div key={c.id} className="card">
       <div style={s.cardTop}>
                <div style={s.avatar}>{c.avatar}</div>
                <div style={{ flex: 1 }}>
                  <h3 style={s.name}>{c.name}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{c.title}</p>
                  <span className={`badge ${c.badge}`} style={{ marginTop: '6px', display: 'inline-block' }}>{c.specialization}</span>
                </div>
              </div>

              <p style={s.bio}>{c.bio}</p>
              <div style={s.metaRow}>
                <div style={s.metaItem}><span style={s.metaLabel}>Experience</span><span style={s.metaVal}>{c.exp}</span></div>
                <div style={s.metaItem}><span style={s.metaLabel}>Sessions</span><span style={s.metaVal}>{c.sessions}+</span></div>
                <div style={s.metaItem}><span style={s.metaLabel}>Rating</span><span style={{ ...s.metaVal, color: '#f4a825' }}>⭐ {c.rating}</span></div>
              </div>
 {/* Star rating visual */}
              <div style={{ marginBottom: '12px' }}>
                {[1,2,3,4,5].map(star => (
                  <span key={star} style={{ color: star <= Math.round(c.rating) ? '#f4a825' : 'rgba(255,255,255,0.15)', fontSize: '1rem' }}>★</span>
                ))}
                <span style={{ color: 'var(--muted)', fontSize: '0.78rem', marginLeft: '6px' }}>{c.rating}/5</span>
              </div>




      <div style={s.slotPreview}>
        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>
          Available Slots
        </span>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {slots.length === 0 && (
            <span style={{ color: 'var(--muted)' }}>Loading...</span>
          )}

          {slots.slice(0, 4).map(slot => (
            <span
              key={slot.id}
              style={{
                ...s.slot,
                opacity: slot.booked ? 0.4 : 1,
                background: slot.booked
                  ? "rgba(239,68,68,0.1)"
                  : "rgba(34,197,94,0.1)"
              }}
            >
              {slot.time} {slot.booked ? "🔴" : "🟢"}
            </span>
          ))}
        </div>
      </div>
<div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button className="btn-outline" style={{ flex: 1, padding: '9px', fontSize: '0.85rem' }} onClick={() => { setSelected(c); setResumeView(false) }}>
                  👤 View Profile
                </button>
                <button className="btn-primary" style={{ flex: 1, padding: '9px', fontSize: '0.85rem' }} onClick={handleBook}>
                  📅 Book Session
                </button>
              </div>
    </div>
  )
})}
                  </div>
      </div>

      {/* Profile Modal */}
      {selected && (
        <div style={s.overlay} onClick={() => setSelected(null)}>
          <div style={s.modal} onClick={e => e.stopPropagation()}>
            <button style={s.closeBtn} onClick={() => setSelected(null)}>✕</button>

            {!resumeView ? (
              <>
                <div style={s.modalHeader}>
                  <div style={{ ...s.avatar, width: '72px', height: '72px', fontSize: '1.5rem', flexShrink: 0 }}>{selected.avatar}</div>
                  <div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.6rem', marginBottom: '4px' }}>{selected.name}</h2>
                    <p style={{ color: 'var(--muted)', marginBottom: '8px' }}>{selected.title}</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span className={`badge ${selected.badge}`}>{selected.specialization}</span>
                      <span style={{ color: '#f4a825', fontWeight: '700' }}>⭐ {selected.rating}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{selected.sessions}+ sessions</span>
                    </div>
                  </div>
                </div>

                {/* Star bar */}
                <div style={{ marginBottom: '16px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: star <= Math.round(selected.rating) ? '#f4a825' : 'rgba(255,255,255,0.15)', fontSize: '1.3rem' }}>★</span>
                  ))}
                  <span style={{ color: 'var(--muted)', fontSize: '0.85rem', marginLeft: '8px' }}>{selected.rating}/5 based on student reviews</span>
                </div>

                <p style={{ color: 'var(--muted)', lineHeight: '1.7', marginBottom: '20px' }}>{selected.bio}</p>

                <div style={{ background: 'rgba(10,22,40,0.6)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Available Time Slots</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {modalSlots.map(slot => (
  <div key={slot.id} style={s.slot}>
    {slot.date} · {slot.time} {slot.booked ? "🔴" : "🟢"}
  </div>
))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }} onClick={() => setResumeView(true)}>
                    📄 View Resume / CV
                  </button>
                  <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }} onClick={handleBook}>
                    📅 Book Free Session →
                  </button>
                </div>
                {!auth?.role && (
                  <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.8rem', marginTop: '10px' }}>
                    🔒 Sign in required to book a session.
                  </p>
                )}
              </>
            ) : (
              /* Resume View */
              <>
                <button onClick={() => setResumeView(false)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px' }}>← Back to Profile</button>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', marginBottom: '20px' }}>Resume / CV — {selected.name}</h3>
                <div style={{ background: 'rgba(10,22,40,0.7)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '2px' }}>{selected.name}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{selected.title} · {selected.specialization} Specialist</div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={s.resumeHead}>Experience</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: '1.7' }}>✦ {selected.exp} of career counseling experience<br />✦ {selected.sessions}+ students mentored successfully</div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={s.resumeHead}>Specialisation</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: '1.7' }}>✦ {selected.domain}<br />✦ {selected.specialization} career pathways</div>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <div style={s.resumeHead}>Bio</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.88rem', lineHeight: '1.7' }}>{selected.bio}</div>
                  </div>
                  <div>
                    <div style={s.resumeHead}>Rating & Reviews</div>
                    <div style={{ color: '#f4a825', fontSize: '1.1rem' }}>{[1,2,3,4,5].map(s2 => <span key={s2}>{s2 <= Math.round(selected.rating) ? '★' : '☆'}</span>)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.82rem', marginTop: '4px' }}>{selected.rating}/5 — based on student ratings</div>
                  </div>
                  <a href={selected.resume} target="_blank" rel="noreferrer" className="btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '20px', padding: '11px', borderRadius: '10px', fontSize: '0.9rem' }}>
                    ↗ Download Full Resume PDF
                  </a>
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: '14px', padding: '12px' }} onClick={handleBook}>
                  📅 Book a Session with {selected.name.split(' ')[0]} →
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  eyebrow: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--purple-light)', textTransform: 'uppercase', marginBottom: '12px' },
  tabRow: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '20px' },
  tab: { background: 'rgba(10,22,40,0.7)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '6px', padding: '8px 18px', fontSize: '0.88rem', cursor: 'pointer' },
  tabActive: { background: 'rgba(159,103,255,0.12)', borderColor: 'var(--purple-light)', color: 'var(--purple-light)' },
  cardTop: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px' },
  avatar: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #1d3557, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.95rem', flexShrink: 0 },
  name: { fontSize: '1rem', fontWeight: '700', marginBottom: '2px' },
  bio: { color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '14px' },
  metaRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '10px 0', marginBottom: '12px' },
  metaItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  metaLabel: { fontSize: '0.7rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' },
  metaVal: { fontSize: '0.9rem', fontWeight: '600' },
  slotPreview: { background: 'rgba(10,22,40,0.5)', borderRadius: '8px', padding: '10px' },
  slot: { background: 'rgba(159,103,255,0.08)', border: '1px solid rgba(159,103,255,0.2)', color: 'var(--purple-light)', borderRadius: '6px', padding: '3px 10px', fontSize: '0.78rem' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  modal: { background: '#0d1e35', border: '1px solid rgba(159,103,255,0.2)', borderRadius: '16px', padding: '32px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: '14px', right: '14px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', padding: '5px 10px', cursor: 'pointer' },
  modalHeader: { display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' },
  resumeHead: { fontSize: '0.78rem', color: 'var(--purple-light)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' },
}
