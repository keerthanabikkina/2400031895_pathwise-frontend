import { useState,useEffect } from 'react'
import AppointmentCalendar from '../components/AppointmentCalendar'
import { Link } from 'react-router-dom'
import { useNotifications } from "../context/NotificationContext"

const careerMatches = [
  { title: 'Software Engineer', match: 92, icon: '💻' },
  { title: 'Data Scientist', match: 87, icon: '📊' },
  { title: 'Product Manager', match: 78, icon: '🚀' },
]

const resources = [
  { title: 'How to Choose Your First Job', type: 'Article', time: '5 min', icon: '📝', category: 'Career Planning' },
  { title: 'Cracking FAANG Interviews in 2025', type: 'Guide', time: '15 min', icon: '🎯', category: 'Technology' },
  { title: 'Building a Standout Resume', type: 'Video', time: '12 min', icon: '▶️', category: 'Resume Tips' },
  { title: 'Top High-Growth Careers Right Now', type: 'Article', time: '7 min', icon: '📈', category: 'Trends' },
  { title: 'GATE 2025 Preparation Strategy', type: 'Guide', time: '10 min', icon: '🎓', category: 'B.Tech' },
  { title: 'MBA vs MTech – Which Path?', type: 'Article', time: '8 min', icon: '🤔', category: 'Career Planning' },
]

export default function UserDashboard({ auth, counselors, onFeedback, feedback }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [feedbackModal, setFeedbackModal] = useState(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [assessAnswers, setAssessAnswers] = useState({})
  const [assessDone, setAssessDone] = useState(false)
const [appointments, setAppointments] = useState([])
const [loading, setLoading] = useState(true)
const [submitting, setSubmitting] = useState(false)
const [tab, setTab] = useState("upcoming")
const [search, setSearch] = useState("")
const [feedbackData, setFeedbackData] = useState([])

const { addNotification } = useNotifications()
const [notifiedSessions, setNotifiedSessions] = useState([])
const [popupSession, setPopupSession] = useState(null)

  const userName = auth?.name || 'Student'
const myFeedback = feedback.filter(f => f.studentEmail === auth?.email)
const [now, setNow] = useState(new Date())

useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date())
  }, 1000)

  return () => clearInterval(interval)
}, [])
useEffect(() => {
  const loadFeedback = async () => {
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:8081/api/feedback/my", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    setFeedbackData(data)
  }

  loadFeedback()
}, [])
useEffect(() => {
  if (!popupSession) return

  const timer = setTimeout(() => {
    setPopupSession(null)
  }, 10000)

  return () => clearTimeout(timer)
}, [popupSession])
useEffect(() => {
  appointments.forEach(a => {
    if (a.status !== "accepted") return

    const sessionTime = parseDateTime(a.date, a.time)
    const diff = sessionTime - now

    const is15Min = diff <= 15 * 60 * 1000 && diff > 14 * 60 * 1000
const shown = localStorage.getItem("notif_" + a.id)
    if (is15Min && !notifiedSessions.includes(a.id)&& !shown) {

      

      // 🔊 SOUND
      const audio = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1152-pristine.mp3")
      audio.play()

      // 🔥 OPEN POPUP
      setPopupSession(a)
localStorage.setItem("notif_" + a.id, "shown")
      setNotifiedSessions(prev => [...prev, a.id])
    }
  })
}, [now, appointments])

const getMeetingStatus = (date, time) => {
  const sessionTime = parseDateTime(date, time)
  const diff = sessionTime - now

  if (diff > 15 * 60 * 1000) return "not_ready"   // ❌ no join
  if (diff > 0) return "ready"                    // ✅ join appears (15 min before)
  if (diff > -60 * 60 * 1000) return "live"       // 🟢 during meeting
  return "ended"                                 // 🔴 after 1 hour
}
const getCountdown = (date, time) => {
  const sessionTime = parseDateTime(date, time)
  const diff = sessionTime - now

  if (diff <= 0) return "Starting..."

  const mins = Math.floor(diff / (1000 * 60))
  const secs = Math.floor((diff / 1000) % 60)

  return `${mins}m ${secs}s`
}
const parseDateTime = (date, time) => {
  const [t, modifier] = time.trim().split(" ")
  let [hours, minutes] = t.split(":")

  hours = parseInt(hours)

  if (modifier === "PM" && hours !== 12) hours += 12
  if (modifier === "AM" && hours === 12) hours = 0

  const h = String(hours).padStart(2, "0")
  const m = String(minutes).padStart(2, "0")

  return new Date(`${date}T${h}:${m}:00`)
}

const getTimeLabel = (dateObj) => {
  const now = new Date()
  const diff = dateObj - now

  const mins = Math.floor(diff / (1000 * 60))
  const hrs = Math.floor(mins / 60)
  const days = Math.floor(hrs / 24)

  if (diff > 0) {
    if (days > 0) return `Starts in ${days} day(s)`
    if (hrs > 0) return `Starts in ${hrs} hr(s)`
    return `Starts in ${mins} min(s)`
  } else {
    return "Expired"
  }
}


  const submitFeedback = async () => {
  if (!rating || submitting) return
       setSubmitting(true)

  try {
    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:8081/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        appointmentId: feedbackModal.id,
        counselorId: feedbackModal.counselorId,
        counselorName: feedbackModal.counselorName,
        studentName: auth.name,
        rating: rating,   // ⭐ THIS IS YOUR RATING VALUE
        comment: comment
      })
    })
if (!res.ok) {
  console.error("❌ Failed to fetch feedback")
  return
}

    const data = await res.json()
    console.log("✅ Feedback saved:", data)

    // ✅ CLOSE MODAL
    setFeedbackModal(null)
    setRating(0)
    setComment("")

    // ✅ RELOAD PAGE DATA (IMPORTANT)
setFeedbackData(prev => [
  ...prev,
  {
    appointmentId: feedbackModal.id
  }
])
  } catch (err) {
    console.error("❌ Error saving feedback:", err)
  }
}
const upcoming = appointments
  .map(a => ({
    ...a,
    dateObj: parseDateTime(a.date, a.time)
  }))
  .filter(a => a.dateObj >= new Date()) // ✅ only future
  .sort((a, b) => a.dateObj - b.dateObj) // ✅ nearest first
  .slice(0, 3)


useEffect(() => {
  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/appointments/my", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      console.log("📅 My Appointments:", data)

      setAppointments(data)

    } catch (err) {
      console.error("❌ Error fetching appointments:", err)
    } finally {
      setLoading(false)
    }
  }

  loadAppointments()
}, [])
  
const alreadyRated = (apptId) =>
  feedbackData.some(f => f.appointmentId === apptId)
  const quizItems = [
    { q: 'Which activities do you enjoy most?', options: ['Building/Coding', 'Helping/Advising', 'Analysing data', 'Creating art'] },
    { q: 'Preferred work environment?', options: ['Startup / Fast-paced', 'Corporate / Structured', 'Research / Academic', 'Freelance / Remote'] },
    { q: 'What matters most in a career?', options: ['High salary', 'Social impact', 'Creative freedom', 'Work-life balance'] },
    { q: 'Subjects you enjoyed most?', options: ['Math & Science', 'Commerce & Economics', 'Arts & Literature', 'Social Studies'] },
  ]
if (loading) {
  return <div style={{ padding: 40 }}>Loading appointments...</div>
}

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" />

      <div style={{ background: 'rgba(174, 82, 239, 0.4)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <p style={{ color: 'var(--purple-light)', fontSize: '0.78rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Welcome back</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.9rem', marginBottom: '2px' }}>{userName}</h1>
            <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>{auth?.email}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to="/schedule" className="btn-primary">+ Book Session</Link>
            <Link to="/careers" className="btn-outline">Explore Careers</Link>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', background: 'rgba(10,22,40,0.5)' }}>
<div
  className="container"
  style={{
    display: 'flex',
    justifyContent: 'center', // 🔥 CENTER
    maxWidth: '1100px',
    margin: '0 auto',
  }}
>          {['overview', 'sessions', 'calendar', 'resources', 'assessment'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ ...st.tab, ...(activeTab === tab ? st.tabActive : {}) }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

<div
  className="container"
  style={{
    padding: '40px 20px',
    maxWidth: '1100px',
    margin: '0 auto',
  }}
>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            <div style={st.statsGrid}>
  {[ 
    { val: appointments.filter(a => a.status !== 'pending').length, label: 'Sessions Completed', color: 'var(--purple-light)' },
    { val: appointments.filter(a => a.status === 'pending').length, label: 'Upcoming Sessions', color: '#f4a825' },
    { val: 6, label: 'Resources Read', color: 'var(--purple-light)' },
    { val: '92%', label: 'Top Career Match', color: '#81c784' },
  ].map((item, i) => (
    <div
      key={i}
      className="card"
      style={st.statCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-10px) scale(1.04)";
        e.currentTarget.style.boxShadow = "0 25px 70px rgba(124,58,237,0.5)";
        e.currentTarget.style.border = "1px solid rgba(124,58,237,0.6)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
        e.currentTarget.style.border = "1px solid var(--border)";
      }}
    >
      <div style={st.statGlow}></div>
      <div style={{ ...st.statNum, color: item.color }}>{item.val}</div>
      <div style={st.statLabel}>{item.label}</div>
    </div>
  ))}
</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '24px' }}>
              <div className="card">
<h3 style={st.cardH}>
  Upcoming Sessions
  <span style={{
    marginLeft: "8px",
    fontSize: "0.75rem",
    background: "#7c3aed",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: "10px"
  }}>
    {upcoming.length}
  </span>
</h3>                {upcoming.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: '0.88rem' }}>
                    No sessions booked yet.<br />
                    <Link to="/schedule" style={{ color: 'var(--purple-light)', fontWeight: 600 }}>Book your first session →</Link>
                  </div>
                ) : upcoming.map((a, i) => {
                  const status = getMeetingStatus(a.date, a.time)

    return(
<div
  key={i}
  style={st.sessionItem}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
    e.currentTarget.style.transform = "translateX(6px)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = "transparent";
    e.currentTarget.style.transform = "none";
  }}
>                    <div style={st.smallAv}>{counselors.find(c => c.id === a.counselorId)?.avatar || '?'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{a.counselorName}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{a.sessionType} · {a.date} · {a.time}</div>
                    </div>
<div style={{
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "6px"
}}>
  <>
  <span style={statusStyle(a.status)}>
    {a.status || "pending"}
  </span>

  {/* ⏳ BEFORE 15 MIN */}
  {status === "not_ready" && (
    <div style={{ fontSize: "0.75rem", color: "#888" }}>
      ⏳ {getCountdown(a.date, a.time)}
    </div>
  )}

  {/* 🟡 15 MIN BEFORE */}
  {status === "ready" && (
    <>
      <div style={{ fontSize: "0.7rem", color: "#f4a825" }}>
        ⏳ Starting soon
      </div>

      {a.meetingLink && (
        <a href={a.meetingLink} target="_blank"
          style={joinBtn}>
          🎥 Join & Prepare
        </a>
      )}
    </>
  )}

  {/* 🟢 LIVE */}
  {status === "live" && (
    <>
      <div style={{ color: "#22c55e", fontSize: "0.7rem" }}>
        🟢 LIVE
      </div>

      {a.meetingLink && (
        <a href={a.meetingLink} target="_blank"
          style={joinBtn}>
          🎥 Join Now
        </a>
      )}
    </>
  )}

  {/* 🔴 ENDED */}
  {status === "ended" && (
    <div style={{ color: "#ef4444", fontSize: "0.75rem" }}>
      🔴 Ended
    </div>
  )}
</>

  <span style={{
    fontSize: "0.75rem",
    color: "#f4a825",
    fontWeight: "500"
  }}>
    {getTimeLabel(parseDateTime(a.date, a.time))}
  </span>
</div>
      </div>
                )})}
<div style={{
  textAlign: 'center',
  padding: '30px 0',
  color: 'var(--muted)'
}}>
  <div style={{ fontSize: "2rem" }}>📅</div>
  <Link to="/schedule" style={{
    color: 'var(--purple-light)',
    fontWeight: 600
  }}>
    Book a session →
  </Link>
</div>              </div>

              <div className="card">
                <h3 style={st.cardH}>Your Career Matches</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.83rem', marginBottom: '16px' }}>Based on your profile and assessment</p>
                {careerMatches.map((c, i) => (
                  <div key={i} style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', fontSize: '0.93rem' }}>{c.icon} {c.title}</span>
                      <span style={{ color: '#ff8e8e', fontWeight: '700', fontSize: '0.88rem' }}>{c.match}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${c.match}%`, height: '100%', borderRadius: '3px', background: i === 0 ? 'var(--purple-light)' : i === 1 ? '#ff8e8e' : '#b39ddb' }} />
                    </div>
                  </div>
                ))}
                <button className="btn-outline" style={{ width: '100%', marginTop: '8px', padding: '10px', fontSize: '0.88rem' }} onClick={() => setActiveTab('assessment')}>
                  Take Full Assessment →
                </button>
              </div>
            </div>
          </div>
        )}

       {activeTab === 'sessions' && (
  <div>

    <h3 style={{ marginBottom: "20px" }}>📅 My Sessions</h3>

    {/* 🔥 TABS */}
    <div style={tabContainer}>
      {["upcoming", "past"].map(t => (
        <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>
          {t.toUpperCase()}
          {tab === t && <div style={tabUnderline} />}
        </button>
      ))}
    </div>

    {/* 🔍 SEARCH */}
    <input
      placeholder="🔍 Search counselor..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={searchBox}
    />

    {/* LIST */}
    {appointments
      .filter(a => {
  const dateObj = parseDateTime(a.date, a.time)
  const current = new Date()

  return tab === "upcoming"
    ? dateObj >= current
    : dateObj < current
})
      .filter(a =>
        a.counselorName.toLowerCase().includes(search.toLowerCase())
      )
      .map(a => {
        const dateObj = parseDateTime(a.date, a.time)

        return (
          <div key={a.id} style={card}>

            {/* LEFT */}
            <div>
              <h4>{a.counselorName}</h4>
              <p style={{ color: "#aaa" }}>
                {a.date} · {a.time}
              </p>

              <small style={{ color: "#f4a825" }}>
                {getTimeLabel(dateObj)}
              </small>
            </div>

            {/* RIGHT */}
            <div style={{ textAlign: "right" }}>
              <span style={statusStyle(a.status)}>
                {a.status}
              </span>
{a.status === "accepted" && (() => {
  const status = getMeetingStatus(a.date, a.time)

  return (
    <>
      {/* 🟡 NOT STARTED */}
      {status === "not_ready" && (
        <div style={{
          marginTop: "6px",
          fontSize: "0.75rem",
          color: "#f4a825"
        }}>
          ⏳ Starts in {getCountdown(a.date, a.time)}
        </div>
      )}
{status === "ready" && (
  <>
    <div style={{ marginTop: "6px",fontSize: "0.7rem", color: "#f4a825" }}>
      ⏳ Starting soon
    </div>

    {a.meetingLink && (
      <a href={a.meetingLink} target="_blank" style={joinBtn}>
        🎥 Join & Prepare
      </a>
    )}
  </>
)}
      {/* 🟢 LIVE */}
      {status === "live" && (
        <>
          <div style={{
            fontSize: "0.7rem",
            color: "#22c55e",
            marginTop: "4px",
            fontWeight: "600"
          }}>
            🟢 LIVE NOW
          </div>

          {a.meetingLink && (
            <a
              href={a.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                marginTop: "6px",
                padding: "6px 10px",
                borderRadius: "8px",
                background: "#22c55e",
                color: "#fff",
                fontSize: "0.75rem",
                textDecoration: "none",
                animation: "pulse 1.5s infinite"
              }}
            >
              🎥 Join Now
            </a>
          )}
        </>
      )}

      {/* 🔴 ENDED */}
      {status === "ended" && (
        <div style={{
          marginTop: "6px",
          fontSize: "0.75rem",
          color: "#ef4444"
        }}>
          🔴 Session Ended
        </div>
      )}

      {alreadyRated(a.id) ? (
      <span style={{ color: "#64ffda", fontSize: "0.8rem" }}>
        ✓ Rated
      </span>
    ) : (
      <button
        onClick={() => setFeedbackModal(a)}
        style={rateBtn}
      >
        ⭐ Rate
      </button>
    )}

    </>
  )
})()}
              
            </div>

          </div>
        )
      })}
  </div>
)}
        {/* RESOURCES */}
        {activeTab === 'resources' && (
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '20px' }}>Learning Resources</h3>
            <div className="grid-3">
              {resources.map((r, i) => (
<div
  key={i}
  className="card"
  style={st.resourceCard}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-8px)";
    e.currentTarget.style.boxShadow = "0 20px 60px rgba(59,130,246,0.4)";
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "none";
    e.currentTarget.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
  }}
>                  <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{r.icon}</div>
                  <span className="badge badge-teal" style={{ marginBottom: '8px', display: 'inline-block' }}>{r.category}</span>
                  <h4 style={{ fontWeight: '700', marginBottom: '6px', lineHeight: '1.4', fontSize: '0.95rem' }}>{r.title}</h4>
                  <p style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{r.type} · {r.time} read</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* CALENDAR */}
        {activeTab === 'calendar' && (
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '20px' }}>📅 My Session Calendar</h3>
            <AppointmentCalendar appointments={appointments} counselors={counselors} />
          </div>
        )}

        {/* ASSESSMENT */}
        {activeTab === 'assessment' && (
  <div
    style={{
      maxWidth: '700px',
      margin: '0 auto', // 🔥 CENTER
      textAlign: 'center', // optional for heading alignment
    }}
  >
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>Career Interests Assessment</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '0.88rem' }}>Answer these to get personalised career matches. Takes about 3 minutes.</p>
            {quizItems.map((item, i) => (
              <div key={i} className="card" style={{ marginBottom: '14px' }}>
                <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.93rem' }}>Q{i + 1}. {item.q}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {item.options.map((opt, j) => (
                    <button key={j} onClick={() => setAssessAnswers(prev => ({ ...prev, [i]: j }))} style={{
                      background: assessAnswers[i] === j ? 'rgba(159,103,255,0.15)' : 'rgba(177, 183, 192, 0.7)',
                      border: `1px solid ${assessAnswers[i] === j ? 'var(--purple-light)' : 'var(--border)'}`,
                      borderRadius: '8px', padding: '10px 12px',
                      color: assessAnswers[i] === j ? 'var(--white)' : 'var(--muted)',
                      cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', transition: 'all 0.2s',
                    }}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            {!assessDone ? (
              <button className="btn-primary" style={{ width: '100%' }}
                disabled={Object.keys(assessAnswers).length < quizItems.length}
                onClick={() => setAssessDone(true)}>
                Get My Career Matches →
              </button>
            ) : (
              <div style={{ background: 'rgba(159,103,255,0.06)', border: '1px solid rgba(159,103,255,0.25)', borderRadius: '14px', padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎯</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '8px' }}>Your Top Match: Software Engineer</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.88rem', marginBottom: '16px' }}>Based on your answers, you're best suited for tech & analytical roles. Book a counseling session for a detailed roadmap.</p>
                <Link to="/schedule" className="btn-primary">Book a Counseling Session →</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackModal && (
        <div style={st.overlay} onClick={() => setFeedbackModal(null)}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <button style={st.closeBtn} onClick={() => setFeedbackModal(null)}>✕</button>
            <h3 style={{ fontFamily: 'Syne, sans-serif', marginBottom: '6px' }}>Rate Your Session</h3>
            <p style={{ color: 'var(--muted)', marginBottom: '20px', fontSize: '0.88rem' }}>Session with {feedbackModal.counselorName}</p>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <span key={star} onClick={() => setRating(star)} style={{ fontSize: '2.5rem', cursor: 'pointer', color: star <= rating ? '#f4a825' : 'rgba(255,255,255,0.15)', transition: 'color 0.2s' }}>★</span>
              ))}
              <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                {rating === 0 ? 'Tap to rate' : ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
              </div>
            </div>
            <div className="form-group">
              <label>Comments (optional)</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows="3" placeholder="Share your experience with this counselor..." />
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '8px', opacity: rating ? 1 : 0.4 }} disabled={!rating} onClick={submitFeedback}>
              Submit Rating →
            </button>
          </div>
        </div>
      )}
      {popupSession && (
  <div style={popupOverlay}>
    <div style={popupBox}>

      <h3 style={{ marginBottom: "10px" }}>
        🚀 Session Starting Soon
      </h3>

      <p style={{ fontSize: "0.9rem", marginBottom: "6px" }}>
        <b>{popupSession.counselorName}</b>
      </p>

      <p style={{ color: "#aaa", fontSize: "0.8rem" }}>
        {popupSession.date} · {popupSession.time}
      </p>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        
        {popupSession.meetingLink && (
          <a
            href={popupSession.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            style={joinNowBtn}
          >
            🎥 Join Now
          </a>
        )}

        <button
          onClick={() => setPopupSession(null)}
          style={dismissBtn}
        >
          Dismiss
        </button>

      </div>

    </div>
  </div>
)}
    </div>
  )
}

const st = {
  tab: {
    padding: '13px 18px',
    background: 'none',
    border: 'none',
    color: 'var(--muted)',
    fontSize: '0.88rem',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.3s ease',
  },

  tabActive: {
    color: 'var(--white)',
    borderBottomColor: 'var(--purple-light)',
  },

  statsGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '24px',
  justifyContent: 'center', // 🔥 IMPORTANT
  maxWidth: '900px',
  margin: '0 auto', // 🔥 CENTER BLOCK
},

  statCard: {
    position: 'relative',
    textAlign: 'center',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },

  statGlow: {
    position: 'absolute',
    inset: 0,
    background: 'radial-gradient(circle at top, rgba(124,58,237,0.2), transparent 60%)',
  },

 statNum: {
  fontSize: '2.4rem',        // slightly reduced for balance
  fontWeight: '700',         // less heavy = cleaner
  lineHeight: '1.2',         // better readability
  marginBottom: '6px',       // ✅ FIXED spacing
  letterSpacing: '-0.5px',   // tighter & modern look
},

  statLabel: {
    color: 'var(--muted)',
    fontSize: '0.83rem',
  },

  cardH: {
    fontWeight: '700',
    marginBottom: '14px',
    fontSize: '0.98rem',
  },

  sessionItem: {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 10px',
  borderBottom: '1px solid rgba(255,255,255,0.08)', // 👈 softer line
  borderRadius: '8px',
  transition: 'all 0.25s ease',
},
  smallAv: {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', // 🔥 richer
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: '700',
  fontSize: '0.75rem',
  boxShadow: '0 0 10px rgba(124,58,237,0.5)', // ✨ glow
},

  bigAv: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #1d3557, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontWeight: '700',
    fontSize: '0.95rem',
    flexShrink: 0,
  },

  progressWrap: {
    height: '6px',
    background: 'rgba(255,255,255,0.07)',
    borderRadius: '3px',
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: '3px',
    background: 'linear-gradient(90deg,#7c3aed,#3b82f6)',
    transition: 'width 0.8s ease',
  },

  resourceCard: {
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.8)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },

  modal: {
    background: '#0d1e35',
    border: '1px solid rgba(159,103,255,0.2)',
    borderRadius: '16px',
    padding: '32px',
    maxWidth: '440px',
    width: '100%',
    position: 'relative',
  },

  closeBtn: {
    position: 'absolute',
    top: '14px',
    right: '14px',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--muted)',
    padding: '5px 10px',
    cursor: 'pointer',
  },

  
}
const tabContainer = {
  display: "flex",
  gap: "30px",
  marginBottom: "20px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  paddingBottom: "5px"
}

const tabBtn = (active) => ({
  position: "relative",
  padding: "8px 0",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontWeight: "600",
  color: active ? "#8b5cf6" : "#888"
})

const tabUnderline = {
  position: "absolute",
  bottom: "-6px",
  left: 0,
  height: "2px",
  width: "100%",
  background: "linear-gradient(90deg,#7c3aed,#a78bfa)"
}

const searchBox = {
  width: "100%",
  padding: "12px",
  marginBottom: "20px",
  borderRadius: "10px"
}

const card = {
  marginBottom: "15px",
  padding: "18px",
  borderRadius: "14px",
  background: "rgba(20,30,60,0.6)",
  display: "flex",
  justifyContent: "space-between"
}

const statusStyle = (status) => ({
  padding: "6px 14px",
  borderRadius: "20px",
  background:
    status === "accepted"
      ? "rgba(34,197,94,0.15)"
      : status === "rejected"
      ? "rgba(239,68,68,0.15)"
      : "rgba(244,168,37,0.15)",
  color:
    status === "accepted"
      ? "#22c55e"
      : status === "rejected"
      ? "#ef4444"
      : "#f4a825"
})

const rateBtn = {
  marginTop: "8px",
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  cursor: "pointer"
}
const joinBtn = {
  display: "block",
  marginTop: "6px",
  padding: "7px 12px",
  borderRadius: "10px",
  background: "#22c55e",
  color: "#fff",
  fontSize: "0.8rem",
  fontWeight: "600",
  textDecoration: "none"
}

const popupOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999
}

const popupBox = {
  background: "#0d1e35",
  padding: "24px",
  borderRadius: "14px",
  width: "320px",
  textAlign: "center",
  border: "1px solid rgba(124,58,237,0.3)",
  boxShadow: "0 0 25px rgba(124,58,237,0.5)"
}

const joinNowBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  background: "#22c55e",
  color: "#fff",
  textDecoration: "none",
  fontWeight: "600"
}

const dismissBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#444",
  color: "#fff",
  cursor: "pointer"
}