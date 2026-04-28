import { useState,useEffect } from 'react'



const sessionTypes = [
  { id: 'discovery', icon: '🗺️', label: 'Career Discovery', desc: 'Explore careers matching your interests & strengths' },
  { id: 'guidance', icon: '🧭', label: 'Pathway Guidance', desc: 'Get a personalised roadmap for your career' },
  { id: 'resume', icon: '📄', label: 'Resume Review', desc: 'Expert feedback on your resume and portfolio' },
  { id: 'mock', icon: '🎯', label: 'Mock Interview', desc: 'Practice with real questions and get live feedback' },
]

// ─── Counselor Resume Side Panel ───────────────────────────────────
function ResumePanel({ c }) {
  if (!c) {
    return (
      <div style={rs.empty}>
        <div style={{ fontSize: '3rem', marginBottom: '14px',  opacity: 0.3 }}>👤</div>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', textAlign: 'center', lineHeight: '1.6' }}>
          Select a mentor from the list<br />to view their profile & resume here
        </p>
      </div>
    )
  }
  return (
    <div style={rs.panel}>
      <div style={rs.header}>
        <div style={rs.av}>{c.avatar}</div>
        <div>
          <div style={rs.name}>{c.name}</div>
          <div style={rs.titleTxt}>{c.title}</div>
          <span className={`badge ${c.badge}`} style={{ marginTop: '6px', display: 'inline-block' }}>{c.specialization}</span>
        </div>
      </div>

      <div style={rs.stars}>
        {[1,2,3,4,5].map(star => (
          <span key={star} style={{ fontSize: '1rem', color: star <= Math.round(c.rating) ? '#f59e0b' : 'rgba(255,255,255,0.12)' }}>★</span>
        ))}
        <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '0.83rem', marginLeft: '6px' }}>{c.rating}/5</span>
        <span style={{ color: 'var(--muted)', fontSize: '0.78rem', marginLeft: '4px' }}>· {c.sessions}+ sessions</span>
      </div>

      <div style={rs.statsRow}>
        <div style={rs.statBox}><div style={rs.statVal}>{c.exp}</div><div style={rs.statLbl}>Experience</div></div>
        <div style={rs.statBox}><div style={rs.statVal}>{c.sessions}+</div><div style={rs.statLbl}>Sessions</div></div>
        <div style={rs.statBox}><div style={{ ...rs.statVal, color: '#4ade80' }}>Free</div><div style={rs.statLbl}>Fee</div></div>
      </div>

      <div style={rs.block}>
        <div style={rs.blockHead}>📋 About</div>
        <p style={rs.blockText}>{c.bio}</p>
      </div>

      <div style={rs.block}>
        <div style={rs.blockHead}>🎓 Domain / Expertise</div>
        <p style={rs.blockText}>{c.domain || c.specialization}</p>
      </div>

      <div style={rs.block}>
        <div style={rs.blockHead}>🕐 Available Slots</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
          {c.slots.map(slot => (
            <span key={slot} style={rs.slot}>{slot}</span>
          ))}
        </div>
      </div>

      <a href={c.resume || '#'} target="_blank" rel="noreferrer" style={rs.dlBtn}>
        📄 Download Resume / CV ↗
      </a>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────
export default function Schedule({ auth, counselors }) {
  const [step, setStep] = useState(1)
  const [selCounselor, setSelCounselor] = useState(null)
  const [selDate, setSelDate] = useState(null)
  const [selTime, setSelTime] = useState(null)
  const [sessionType, setSessionType] = useState(null)
  const [submitted, setSubmitted] = useState(false)
const [slots, setSlots] = useState([])
const [groupedSlots, setGroupedSlots] = useState({})

useEffect(() => {
  const loadSlots = async () => {
    if (!selCounselor) return

    const token = localStorage.getItem("token")

const res = await fetch(
  `http://localhost:8081/api/slots/${selCounselor}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

if (!res.ok) {
  console.error("❌ Failed to load slots")
  return
}

const data = await res.json()

setSlots(data)
    const grouped = data.reduce((acc, s) => {
      if (!acc[s.date]) acc[s.date] = []
      acc[s.date].push(s)
      return acc
    }, {})

    setGroupedSlots(grouped)
  }

 if (!selCounselor) return

  const interval = setInterval(() => {
    loadSlots()
  }, 5000) // refresh every 5 sec

  loadSlots()

}, [selCounselor])
  const [form, setForm] = useState({
    studentName: auth?.name || '',
    email: auth?.email || '',
    phone: '', fatherName: '', fatherPhone: '',
    intermediateGrade: '', stream: '',
    interestedSkills: '', hobbies: '',
    interestedBranch: '', preferredCollege: '',
    studyPreference: '', goal: '',
  })

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const selC = counselors.find(c => c.id === selCounselor)
  const selST = sessionTypes.find(st => st.id === sessionType)

  const ready1 = !!selCounselor && !!sessionType
  const ready2 = selDate !== null && !!selTime
  const ready3 = !!(form.studentName && form.email && form.phone && form.fatherName && form.fatherPhone && form.intermediateGrade && form.goal)

 const handleSubmit = async () => {
  
  if (!ready3) return

  try {
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:8081/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        counselorId: selCounselor,
        counselorName: selC?.name,
        sessionType,
        date:selDate,
        time: selTime,
        studentName: form.studentName,
        phone: form.phone,
        fatherName: form.fatherName,
        fatherPhone: form.fatherPhone,
        intermediateGrade: form.intermediateGrade,
        stream: form.stream,
        interestedSkills: form.interestedSkills,
        hobbies: form.hobbies,
        interestedBranch: form.interestedBranch,
        preferredCollege: form.preferredCollege,
        studyPreference: form.studyPreference,
        goal: form.goal
      })
    })

    const data = await res.json()
    console.log("✅ BOOKED:", data)

    setSubmitted(true)
    // 🔥 reload slots after booking
const slotRes = await fetch(
  `http://localhost:8081/api/slots/${selCounselor}`,
  {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
)

const updatedSlots = await slotRes.json()

setSlots(updatedSlots)

const grouped = updatedSlots.reduce((acc, s) => {
  if (!acc[s.date]) acc[s.date] = []
  acc[s.date].push(s)
  return acc
}, {})

setGroupedSlots(grouped)

  } catch (err) {
    console.error("❌ Booking failed:", err)
  }
}

  const reset = () => {
    setSubmitted(false); setStep(1)
    setSelCounselor(null); setSelDate(null); setSelTime(null); setSessionType(null)
  }

  if (submitted) return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div className="orb orb-1" />
      <div style={s.successBox}>
        <div style={{ fontSize: '4rem', marginBottom: '14px' }}>✅</div>
        <h2 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1.9rem', marginBottom: '10px' }}>Session Booked!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.7', textAlign: 'center' }}>
          Your session with <strong style={{ color: 'var(--white)' }}>{selC?.name}</strong> is confirmed.<br />
          Confirmation sent to <strong style={{ color: 'var(--purple-light)' }}>{auth.email}</strong>
        </p>
        <div style={s.confirmCard}>
          <div style={s.cRow}><span>Counselor</span><strong>{selC?.name}</strong></div>
          <div style={s.cRow}><span>Date & Time</span><strong>{selDate} · {selTime}</strong></div>
          <div style={s.cRow}><span>Session</span><strong>{selST?.icon} {selST?.label}</strong></div>
          <div style={s.cRow}><span>Fee</span><strong style={{ color: '#4ade80' }}>FREE</strong></div>
        </div>
        <button className="btn-primary" style={{ width: '100%' }} onClick={reset}>Book Another Session</button>
      </div>
    </div>
  )

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" />

      {/* Page header */}
      <div style={{ background: 'rgba(177, 135, 186, 0.7)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container">
          <p style={s.eyebrow}>BOOK A SESSION</p>
          <h1 className="section-title" style={{ marginBottom: '8px' }}>Schedule Your Free Counseling</h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '20px' }}>
            Select a mentor → view their resume → pick a time → fill your details.
          </p>
          {/* Steps */}
          <div style={s.stepsRow}>
            {['Choose Mentor & Session', 'Pick Date & Time', 'Your Details'].map((lbl, i) => (
              <div key={i} style={s.stepItem}>
                <div style={{ ...s.stepCircle, ...(step > i + 1 ? s.stepDone : step === i + 1 ? s.stepActive : {}) }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: '0.82rem', color: step === i + 1 ? 'var(--white)' : 'var(--muted)', whiteSpace: 'nowrap' }}>{lbl}</span>
                {i < 2 && <div style={s.stepLine} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '28px 24px' }}>

        {/* ════════ STEP 1 ════════ */}
        {step === 1 && (
          <div style={s.split}>

            {/* LEFT */}
            <div>
              <h3 style={s.sectionHead}>1. Choose a Mentor</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {counselors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelCounselor(c.id)}
                    style={{ ...s.mentorBtn, ...(selCounselor === c.id ? s.mentorBtnOn : {}) }}
                  >
                    <div style={{ ...s.mAv, background: selCounselor === c.id ? 'linear-gradient(135deg,#1d4ed8,#60a5fa)' : 'linear-gradient(135deg,#1e3a5f,#1d4ed8)' }}>
                      {c.avatar}
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--white)', marginBottom: '1px' }}>{c.name}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.76rem', marginBottom: '2px' }}>{c.title}</div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>⭐ {c.rating}</span>
                        <span style={{ color: 'var(--border)', fontSize: '0.7rem' }}>·</span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.74rem' }}>{c.specialization}</span>
                      </div>
                    </div>
                    {selCounselor === c.id && (
                      <span style={s.selBadge}>✓ Selected</span>
                    )}
                  </button>
                ))}
              </div>

              <h3 style={s.sectionHead}>2. Select Session Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px' }}>
                {sessionTypes.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSessionType(st.id)}
                    style={{ ...s.stBtn, ...(sessionType === st.id ? s.stBtnOn : {}) }}
                  >
                    {sessionType === st.id && <div style={s.stCheck}>✓</div>}
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{st.icon}</div>
                    <div style={{ fontWeight: '700', fontSize: '0.84rem', color: 'var(--white)', marginBottom: '3px' }}>{st.label}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.74rem', lineHeight: '1.4' }}>{st.desc}</div>
                  </button>
                ))}
              </div>

              <button
                className="btn-primary"
                onClick={() => ready1 && setStep(2)}
                style={{ width: '100%', padding: '14px', fontSize: '0.97rem', opacity: ready1 ? 1 : 0.38, cursor: ready1 ? 'pointer' : 'not-allowed' }}
              >
                Continue to Time Selection →
              </button>
              {!ready1 && (
                <p style={{ color: 'var(--muted)', fontSize: '0.77rem', marginTop: '8px', textAlign: 'center' }}>
                  Please select a mentor and a session type to continue
                </p>
              )}
            </div>

            {/* RIGHT — Live Resume */}
            <div style={{ position: 'sticky', top: '96px', alignSelf: 'start' }}>
              <h3 style={{ ...s.sectionHead, marginBottom: '12px' }}>
                {selC ? `${selC.name.split(' ')[0]}'s Profile & Resume` : 'Mentor Profile & Resume'}
              </h3>
              <ResumePanel c={selC} />
            </div>
          </div>
        )}

        {/* ════════ STEP 2 ════════ */}
        {step === 2 && (
          <div style={{ maxWidth: '700px' }}>
            <div style={s.miniBar}>
              <div style={s.mAv}>{selC?.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selC?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>{selST?.icon} {selST?.label}</div>
              </div>
              <button onClick={() => setStep(1)} style={s.changeBtn}>← Change</button>
            </div>

            <h3 style={s.sectionHead}>Choose Date</h3>
            <div style={{ display: 'flex', gap: '9px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {Object.keys(groupedSlots).map(date => (
  <button
    key={date}
    onClick={() => {
      setSelDate(date)
      setSelTime(null) // reset time
    }}
    style={{
      ...s.dateBtn,
      ...(selDate === date ? s.dateBtnOn : {})
    }}
  >
    {date}
  </button>
))}
            </div>

            <h3 style={s.sectionHead}>Select Time</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', marginBottom: '28px' }}>
              {groupedSlots[selDate]?.map(slot => (
  <button
    key={slot.id}
    disabled={slot.booked}
    onClick={() => setSelTime(slot.time)}
    style={{
      ...s.timeBtn,
      ...(selTime === slot.time ? s.timeBtnOn : {}),
      opacity: slot.booked ? 0.4 : 1,
      cursor: slot.booked ? "not-allowed" : "pointer",
      background: slot.booked
        ? "rgba(239,68,68,0.1)" // 🔴 booked
        : "rgba(34,197,94,0.1)" // 🟢 available
    }}
  >
    {slot.time} {slot.booked ? "🔴" : "🟢"}
  </button>
))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary" onClick={() => ready2 && setStep(3)} style={{ flex: 1, opacity: ready2 ? 1 : 0.4, cursor: ready2 ? 'pointer' : 'not-allowed' }}>
                Continue to Details →
              </button>
            </div>
          </div>
        )}

        {/* ════════ STEP 3 ════════ */}
        {step === 3 && (
          <div style={{ maxWidth: '760px' }}>
            <div style={s.miniBar}>
              <div style={s.mAv}>{selC?.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{selC?.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: '0.77rem' }}>
                  {selST?.label} · {selDate} · {selTime}
                </div>
              </div>
              <button onClick={() => setStep(2)} style={s.changeBtn}>← Change</button>
            </div>

            <h3 style={{ ...s.sectionHead, marginBottom: '4px' }}>Your Information</h3>
            <p style={{ color: 'var(--muted)', fontSize: '0.84rem', marginBottom: '18px' }}>
              Fill this so your counselor can prepare personalised guidance before your session.
            </p>

            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '22px', marginBottom: '16px' }}>
              <p style={s.secLbl}>📋 Personal Details</p>
              <div style={s.g2}>
                <div className="form-group"><label>Student Full Name *</label><input value={form.studentName} onChange={e => upd('studentName', e.target.value)} placeholder="Your full name" /></div>
                <div className="form-group"><label>Email *</label><input value={form.email} readOnly style={{ opacity: 0.65 }} /></div>
                <div className="form-group"><label>Student Phone *</label><input value={form.phone} onChange={e => upd('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
                <div className="form-group"><label>Intermediate Grade / % *</label><input value={form.intermediateGrade} onChange={e => upd('intermediateGrade', e.target.value)} placeholder="e.g. 88% or CGPA 8.5" /></div>
              </div>

              <p style={s.secLbl}>👨‍👩‍👦 Parent / Guardian</p>
              <div style={s.g2}>
                <div className="form-group"><label>Father / Guardian Name *</label><input value={form.fatherName} onChange={e => upd('fatherName', e.target.value)} placeholder="Father's full name" /></div>
                <div className="form-group"><label>Father / Guardian Phone *</label><input value={form.fatherPhone} onChange={e => upd('fatherPhone', e.target.value)} placeholder="+91 XXXXX XXXXX" /></div>
              </div>

              <p style={s.secLbl}>🎓 Academic & Interests</p>
              <div style={s.g2}>
                <div className="form-group">
                  <label>Stream in 12th</label>
                  <select value={form.stream} onChange={e => upd('stream', e.target.value)}>
                    <option value="">Select stream</option>
                    <option>Science (MPC)</option><option>Science (BiPC)</option>
                    <option>Commerce</option><option>Humanities / Arts</option><option>Vocational</option>
                  </select>
                </div>
                <div className="form-group"><label>Interested Branch / Course</label><input value={form.interestedBranch} onChange={e => upd('interestedBranch', e.target.value)} placeholder="e.g. CSE, ECE, MBA, MBBS" /></div>
                <div className="form-group"><label>Interested Skills</label><input value={form.interestedSkills} onChange={e => upd('interestedSkills', e.target.value)} placeholder="e.g. coding, design, finance" /></div>
                <div className="form-group"><label>Hobbies</label><input value={form.hobbies} onChange={e => upd('hobbies', e.target.value)} placeholder="e.g. chess, music, robotics" /></div>
              </div>

              <div className="form-group"><label>Preferred College / Location</label><input value={form.preferredCollege} onChange={e => upd('preferredCollege', e.target.value)} placeholder="e.g. IIT Hyderabad, NIT, JNTUA..." /></div>
              <div className="form-group">
                <label>Study Preference</label>
                <select value={form.studyPreference} onChange={e => upd('studyPreference', e.target.value)}>
                  <option value="">Select preference</option>
                  <option>Home State (AP / Telangana)</option>
                  <option>Other State in India</option>
                  <option>Abroad (USA / UK / Canada / Australia)</option>
                  <option>Any — Open to Suggestions</option>
                </select>
              </div>
              <div className="form-group"><label>Career Goal / What to discuss in session *</label><textarea value={form.goal} onChange={e => upd('goal', e.target.value)} placeholder="Describe your question or goal. The more detail you give, the better your counselor can help." rows="4" style={{ resize: 'vertical' }} /></div>
            </div>

            <div style={s.summary}>
              <div style={{ fontSize: '0.76rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px', fontWeight: '700' }}>Session Summary</div>
              <div style={s.sumRow}><span>Counselor</span><strong>{selC?.name}</strong></div>
              <div style={s.sumRow}><span>Session Type</span><strong>{selST?.label}</strong></div>
              <div style={s.sumRow}><span>Date & Time</span><strong>{selDate} · {selTime}</strong></div>
              <div style={s.sumRow}><span>Fee</span><strong style={{ color: '#4ade80' }}>FREE</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary" onClick={handleSubmit} style={{ flex: 1, opacity: ready3 ? 1 : 0.4, cursor: ready3 ? 'pointer' : 'not-allowed' }}>
                ✅ Confirm Booking →
              </button>
            </div>
            {!ready3 && <p style={{ color: 'var(--muted)', fontSize: '0.77rem', marginTop: '8px' }}>* Fill all required fields to confirm</p>}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Styles ────────────────────────────────────────────────────────
const s = {
  eyebrow: { fontSize: '0.73rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--purple-light)', textTransform: 'uppercase', marginBottom: '8px' },
  stepsRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  stepItem: { display: 'flex', alignItems: 'center', gap: '8px' },
  stepCircle: { width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', flexShrink: 0 },
  stepActive: { background: 'var(--purple-light)', border: '2px solid var(--purple-light)', color: '#080f1f' },
  stepDone: { background: 'rgba(96,165,250,0.18)', border: '2px solid var(--purple-light)', color: 'var(--purple-light)' },
  stepLine: { width: '24px', height: '2px', background: 'var(--border)', flexShrink: 0 },

  split: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' },
  sectionHead: { fontSize: '0.97rem', fontWeight: '700', color: 'var(--white)', marginBottom: '10px' },

  mentorBtn: {
    display: 'flex', alignItems: 'center', gap: '11px',
    background: 'rgba(8,15,31,0.85)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '11px', padding: '11px 13px', cursor: 'pointer',
    width: '100%', textAlign: 'left', transition: 'border-color 0.16s, background 0.16s',
  },
  mentorBtnOn: {
    background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(96,165,250,0.45)',
    boxShadow: 'inset 0 0 0 1px rgba(96,165,250,0.12)',
  },
  mAv: { width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.82rem', flexShrink: 0 },
  selBadge: { background: 'rgba(96,165,250,0.14)', color: 'var(--purple-light)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '20px', padding: '3px 9px', fontSize: '0.72rem', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 },

  stBtn: {
    background: 'rgba(8,15,31,0.85)', border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '11px', padding: '14px 10px', cursor: 'pointer',
    textAlign: 'center', position: 'relative', transition: 'border-color 0.16s, background 0.16s',
  },
  stBtnOn: { background: 'rgba(29,78,216,0.12)', border: '1px solid rgba(96,165,250,0.45)' },
  stCheck: { position: 'absolute', top: '8px', right: '8px', width: '19px', height: '19px', borderRadius: '50%', background: 'var(--purple-light)', color: '#080f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.68rem', fontWeight: '700' },

  miniBar: { display: 'flex', alignItems: 'center', gap: '11px', background: 'rgba(29,78,216,0.07)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '11px', padding: '11px 14px', marginBottom: '22px' },
  changeBtn: { background: 'none', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', padding: '5px 11px', cursor: 'pointer', fontSize: '0.77rem', flexShrink: 0 },

  dateBtn: { background: 'rgba(8,15,31,0.85)', border: '1px solid var(--border)', borderRadius: '10px', padding: '11px 14px', color: 'var(--white)', cursor: 'pointer', textAlign: 'center', minWidth: '64px', transition: 'all 0.16s' },
  dateBtnOn: { background: 'rgba(29,78,216,0.15)', borderColor: 'var(--purple-light)', color: 'var(--purple-light)' },
  timeBtn: { background: 'rgba(8,15,31,0.85)', border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 16px', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.86rem', transition: 'all 0.16s' },
  timeBtnOn: { background: 'rgba(29,78,216,0.15)', borderColor: 'var(--purple-light)', color: 'var(--purple-light)' },

  secLbl: { fontSize: '0.77rem', fontWeight: '700', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', marginTop: '18px', paddingTop: '14px', borderTop: '1px solid var(--border)' },
  g2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },

  summary: { background: 'rgba(232, 229, 233, 0.91)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px' },
  sumRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: '0.86rem', color: 'var(--muted)' },

  successBox: { background: 'var(--card-bg)', border: '1px solid rgba(96,165,250,0.2)', borderRadius: '20px', padding: '44px', maxWidth: '460px', width: '100%', textAlign: 'center' },
  confirmCard: { background: 'rgba(224, 226, 231, 0.7)', borderRadius: '10px', padding: '14px', marginBottom: '22px', textAlign: 'left' },
  cRow: { display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: '0.86rem', borderBottom: '1px solid var(--border)', color: 'var(--muted)' },
}

const rs = {
  empty: { background: 'rgba(8,15,31,0.6)', border: '2px dashed rgba(255,255,255,0.07)', borderRadius: '14px', padding: '44px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '320px' },
  panel: { background: 'rgba(8,15,31,0.82)', border: '1px solid rgba(96,165,250,0.18)', borderRadius: '14px', padding: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' },
  header: { display: 'flex', gap: '13px', alignItems: 'flex-start', marginBottom: '12px' },
  av: { width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '1rem', flexShrink: 0 },
  name: { fontWeight: '800', fontSize: '1rem', color: 'var(--white)', fontFamily: 'Syne,sans-serif', marginBottom: '2px' },
  titleTxt: { color: 'var(--muted)', fontSize: '0.8rem' },
  stars: { display: 'flex', alignItems: 'center', gap: '1px', marginBottom: '12px' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px', marginBottom: '14px' },
  statBox: { background: 'rgba(29,78,216,0.08)', border: '1px solid rgba(96,165,250,0.1)', borderRadius: '8px', padding: '9px', textAlign: 'center' },
  statVal: { fontWeight: '700', fontSize: '0.9rem', color: 'var(--purple-light)', marginBottom: '2px' },
  statLbl: { color: 'var(--muted)', fontSize: '0.67rem', textTransform: 'uppercase', letterSpacing: '0.06em' },
  block: { marginBottom: '12px' },
  blockHead: { fontSize: '0.72rem', fontWeight: '700', color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '5px' },
  blockText: { color: 'var(--muted)', fontSize: '0.82rem', lineHeight: '1.55' },
  slot: { background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.18)', color: 'var(--purple-light)', borderRadius: '6px', padding: '3px 8px', fontSize: '0.74rem' },
  dlBtn: { display: 'block', textAlign: 'center', marginTop: '14px', background: 'rgba(29,78,216,0.1)', border: '1px solid rgba(96,165,250,0.22)', borderRadius: '9px', padding: '9px', color: 'var(--purple-light)', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none' },
}
