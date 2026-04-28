import { useState, useEffect } from "react"
import { useNotifications } from "../context/NotificationContext"


export default function CounselorDashboard({ auth}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
const [loading, setLoading] = useState(true)
const [showEdit, setShowEdit] = useState(false)
const [editData, setEditData] = useState(null)
const [newDate, setNewDate] = useState("")
const [newTime, setNewTime] = useState("")
const [slots, setSlots] = useState([])
const [tab, setTab] = useState("upcoming")
const [search, setSearch] = useState("")
const [reviews, setReviews] = useState([])
const [now, setNow] = useState(new Date())
const { addNotification } = useNotifications()
const [notifiedSessions, setNotifiedSessions] = useState([])
const [showSlotsPopup, setShowSlotsPopup] = useState(false)
const [selectedDate, setSelectedDate] = useState(null)

const [popupSession, setPopupSession] = useState(null)
const groupedSlots = slots.reduce((acc, s) => {
  if (!acc[s.date]) acc[s.date] = []
  acc[s.date].push(s)
  return acc
}, {})

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
    if (is15Min && !notifiedSessions.includes(a.id) && !shown) {

      

      const audio = new Audio("https://notificationsounds.com/storage/sounds/file-sounds-1152-pristine.mp3")
      audio.play()
localStorage.setItem("notif_" + a.id, "shown")
setPopupSession(a)
      setNotifiedSessions(prev => [...prev, a.id])
    }
  })
}, [now, appointments])
useEffect(() => {
  const interval = setInterval(() => {
    setNow(new Date())
  }, 1000)

  return () => clearInterval(interval)
}, [])

useEffect(() => {
  const loadReviews = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/feedback/counselor", {
        headers: { Authorization: `Bearer ${token}` }
      })

      const data = await res.json()
      setReviews(data)

    } catch (err) {
      console.error("Reviews error:", err)
    }
  }

  loadReviews()
}, [])
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
const formatTime = (time) => {
  const [h, m] = time.split(":")
  let hour = parseInt(h)
  const ampm = hour >= 12 ? "PM" : "AM"
  hour = hour % 12 || 12
  return `${hour}:${m} ${ampm}`
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
useEffect(() => {
  const loadSlots = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/slots/me", {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) return

      const data = await res.json()
      setSlots(data)

    } catch (err) {
      console.error("Slots error:", err)
    }
  }

  loadSlots()
}, [])

useEffect(() => {
  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/appointments/counselor", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()
      console.log("👨‍💼 Counselor Appointments:", data)

      setAppointments(data)

    } catch (err) {
      console.error("❌ Error:", err)
    } finally {
      setLoading(false)
    }
  }

  loadAppointments()
}, [])

useEffect(() => {
  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/counselors", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const data = await res.json()

      // 🔥 find logged-in counselor
const myProfile = data.find(c => c.email === auth?.email)

      console.log("👨‍💼 PROFILE:", myProfile)

      setProfile(myProfile)

    } catch (err) {
      console.error("❌ Profile error:", err)
    }
  }

  if (auth?.name) loadProfile()

}, [auth])

  
if (loading) {
  return <div style={{ padding: 40 }}>Loading appointments...</div>
}
  if (!profile) return <div style={{ padding: 40 }}>Loading...</div>

  const myAppointments = appointments
  const slotsArray = Array.isArray(profile.slots)
  ? profile.slots
  : profile.slots?.split(",") || []



  
  const bookedSlots = appointments.map(a => `${a.date} ${a.time}`)



  const inputStyle = {
  width:'100%',
  marginBottom:'10px',
  padding:'10px',
  borderRadius:'8px',
  border:'1px solid var(--border)',
  background:'rgba(10,22,40,0.8)',
  color:'white'
}

  return (
    <div style={{ paddingTop: "88px", minHeight: "100vh", position: "relative" }}>
      
      {/* HEADER (same as user dashboard) */}
      <div style={{ background: "rgba(183, 91, 241, 0.4)", borderBottom: "1px solid var(--border)", padding: "28px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div>
            <p style={{ color: "var(--purple-light)", fontSize: "0.78rem" }}>
              Counselor Panel
            </p>
            <h1 style={{ fontFamily: "Syne", fontSize: "1.9rem" }}>
              {profile.name}
            </h1>
            <p style={{ color: "var(--muted)" }}>{profile.email}</p>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ borderBottom: "1px solid var(--border)", background: "rgba(10,22,40,0.5)" }}>
        <div className="container" style={{ display: "flex", justifyContent: "center" }}>
          {["overview", "sessions", "calendar","reviews", "profile"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "13px 18px",
                background: "none",
                border: "none",
                color: activeTab === tab ? "#f4a825" : "var(--muted)",
                borderBottom: activeTab === tab ? "2px solid #f4a825" : "none",
                cursor: "pointer"
              }}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="container" style={{ padding: "40px 20px", maxWidth: "1100px", margin: "0 auto" }}>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
              gap: "20px"
            }}>
              {[
                { val: myAppointments.length, label: "Total Sessions", color: "var(--purple-light)" },
                { val: `⭐ ${profile.rating}`, label: "Rating", color: "#f4a825" },
                { val: myAppointments.filter(a => a.status === "pending").length, label: "Pending", color: "#ff8e8e" },
                { val: myAppointments.filter(a => a.status !== "pending").length, label: "Completed", color: "#34d399" }
              ].map((item, i) => (
                <div key={i} className="card" style={{ textAlign: "center" }}>
                  <h2 style={{ color: item.color }}>{item.val}</h2>
                  <p style={{ color: "var(--muted)" }}>{item.label}</p>
                </div>
              ))}
            </div>

            {/* Upcoming Sessions */}
            <div className="card" style={{ marginTop: "24px" }}>
              <h3>Upcoming Sessions</h3>

              {myAppointments.length === 0 ? (
                <p style={{ color: "var(--muted)" }}>No sessions</p>
              ) : (
                myAppointments.slice(0, 3).map((a, i) => {
  const status = getMeetingStatus(a.date, a.time)  // ✅ ADD HERE

  return (
    <div key={i} style={{ marginBottom: "10px" }}>
      <div>
        <b>{a.studentName}</b>
        <div>{a.date} · {a.time}</div>

        {status === "ready" && (
          <a href={a.meetingLink} target="_blank" style={joinBtn}>
            🎥 Join & Prepare
          </a>
        )}

        {status === "live" && (
          <a href={a.meetingLink} target="_blank" style={joinBtn}>
            🎥 Join Now
          </a>
        )}
      </div>
    </div>
  )
})
              )}
            </div>
          </div>
        )}

        {/* SESSIONS */}
        {activeTab === "sessions" && (
  <div>

    <h3 style={{ marginBottom: "20px" }}>📅 Session Requests</h3>

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
      placeholder="🔍 Search student..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={searchBox}
    />

    {/* LIST */}
    {myAppointments
      .filter(a => {
  const dateObj = parseDateTime(a.date, a.time)
  const current = new Date()

  return tab === "upcoming"
    ? dateObj >= current
    : dateObj < current
})
      .filter(a =>
        a.studentName.toLowerCase().includes(search.toLowerCase())
      )
      .map(a => {
        const dateObj = parseDateTime(a.date, a.time)

        return (
          <div key={a.id} style={card}>

            {/* LEFT */}
            <div>
              <h4>{a.studentName}</h4>
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

              {/* 🔥 ACTION BUTTONS */}
              {a.status === "pending" && (
                <div style={{ marginTop: "8px", display: "flex", gap: "6px" }}>
                  <button
                    style={btnGreen}
                    onClick={async () => {
                      const token = localStorage.getItem("token")

                      await fetch(`http://localhost:8081/api/appointments/${a.id}/status`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: "accepted" })
                      })

                      window.location.reload()
                    }}
                  >
                    Accept
                  </button>

                  <button
                    style={btnRed}
                    onClick={async () => {
                      const token = localStorage.getItem("token")

                      await fetch(`http://localhost:8081/api/appointments/${a.id}/status`, {
                        method: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: "rejected" })
                      })

                      window.location.reload()
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
{a.status === "accepted" && (() => {
  const status = getMeetingStatus(a.date, a.time)

  return (
    <>
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
    <div style={{ marginTop: "6px",
fontSize: "0.7rem", color: "#f4a825" }}>
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
    </>
  )
})()}
            </div>

          </div>
        )
      })}
  </div>
)}


       {activeTab === "calendar" && (
  <div
    className="card"
    style={{
      padding: "24px",
      borderRadius: "16px",
      background: "rgba(221, 106, 221, 0.75)",
      border: "1px solid rgba(124,58,237,0.2)"
    }}
  >
    <h3 style={{
      marginBottom: "18px",
      fontFamily: "Syne",
      fontSize: "1.2rem"
    }}>
      📅 Manage Availability
    </h3>

    {/* ADD SLOT BAR */}
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        background: "rgba(10,22,40,0.7)",
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid var(--border)"
      }}
    >
      <input
        type="date"
        value={newDate}
        onChange={e => setNewDate(e.target.value)}
        style={modernInput}
      />

      <input
        type="time"
        value={newTime}
        onChange={e => setNewTime(e.target.value)}
        style={modernInput}
      />

      <button
        style={addBtn}
        onClick={async () => {
          const token = localStorage.getItem("token")

          await fetch("http://localhost:8081/api/slots", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
  date: newDate,
  times: [formatTime(newTime)]   // ✅ FIX HERE
})
          })

          const res = await fetch("http://localhost:8081/api/slots/me", {
            headers: { Authorization: `Bearer ${token}` }
          })
          setSlots(await res.json())

          setNewDate("")
          setNewTime("")
        }}
      >
        ➕ Add
      </button>
    </div>

    {/* SLOT GRID */}
    <div
      style={{
        marginTop: "20px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "14px"
      }}
    >
      {slots.map((s, i) => (
        <div
          key={i}
          style={{
            padding: "14px",
            borderRadius: "12px",
            background: s.booked
              ? "rgba(239,68,68,0.1)"
              : "rgba(34,197,94,0.1)",
            border: "1px solid var(--border)",
            textAlign: "center",
            transition: "0.2s"
          }}
        >
          <div style={{ fontWeight: "600" }}>{s.date}</div>
          <div style={{ fontSize: "0.9rem", margin: "4px 0" }}>
            {s.time}
          </div>

          <div style={{
            fontSize: "0.7rem",
            color: s.booked ? "#ef4444" : "#22c55e"
          }}>
            {s.booked ? "Booked" : "Available"}
          </div>

          {!s.booked && (
            <button
              style={removeBtn}
              onClick={async () => {
                const token = localStorage.getItem("token")

                await fetch(`http://localhost:8081/api/slots/${s.id}`, {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` }
                })

                setSlots(prev => prev.filter(x => x.id !== s.id))
              }}
            >
              ❌ Remove
            </button>
          )}
        </div>
      ))}
    </div>
  </div>
)}
        {showEdit && editData && (
  <div
    style={{
      position:'fixed',
      inset:0,
      background:'rgba(0,0,0,0.8)',
      zIndex:2000,
      display:'flex',
      alignItems:'center',
      justifyContent:'center'
    }}
    onClick={()=>setShowEdit(false)}
  >
    <div
      style={{
        background:'#0d1e35',
        border:'1px solid rgba(159,103,255,0.2)',
        borderRadius:'16px',
        padding:'28px',
        width:'600px',
        maxHeight:'90vh',
        overflowY:'auto',
        position:'relative'
      }}
      onClick={e=>e.stopPropagation()}
    >
 {/* ❌ CLOSE BUTTON */}
      <button
        onClick={()=>setShowEdit(false)}
        style={{
          position:'absolute',
          top:'12px',
          right:'12px',
          background:'none',
          border:'1px solid var(--border)',
          borderRadius:'6px',
          color:'var(--muted)',
          padding:'4px 10px',
          cursor:'pointer'
        }}
      >
        ✕
      </button>
<h3 style={{ marginBottom:'20px', fontFamily:'Syne' }}>
        ✏️ Edit profile
      </h3>
<div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'12px'
      }}>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Full Name</label>

      <input
        value={editData.name || ""}
        onChange={e => setEditData({...editData, name: e.target.value})}
        placeholder="Name"
        style={inputStyle}
      />
      </div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Title</label>

      <input
        value={editData.title || ""}
        onChange={e => setEditData({...editData, title: e.target.value})}
        placeholder="Title"
        style={inputStyle}
      />
</div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Specialization</label>

      <input
        value={editData.specialization || ""}
        onChange={e => setEditData({...editData, specialization: e.target.value})}
        placeholder="Specialization"
        style={inputStyle}
      />
      </div>
 <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Domain</label>

      <input
        value={editData.domain || ""}
        onChange={e => setEditData({...editData, domain: e.target.value})}
        placeholder="Domain"
        style={inputStyle}
      />
      </div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Experience</label>
      <input
        value={editData.exp || ""}
        onChange={e => setEditData({...editData, exp: e.target.value})}
        placeholder="Experience"
        style={inputStyle}
      />
        </div>

      
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Slots</label>

      <input
        value={
  Array.isArray(editData.slots)
    ? editData.slots.join(",")
    : editData.slots || ""
}
        onChange={e => setEditData({...editData, slots: e.target.value})}
        placeholder="Slots (Mon 10AM, Wed 2PM)"
        style={inputStyle}
      />
      </div>
       <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Avatar</label>

<input
  value={editData.avatar || ""}
  onChange={e => setEditData({...editData, avatar: e.target.value})}
  placeholder="Avatar (Initial or URL)"
  style={inputStyle}
/>
</div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Badge</label>
<input
  value={editData.badge || ""}
  onChange={e => setEditData({...editData, badge: e.target.value})}
  placeholder="Badge (Top Mentor, Expert, etc.)"
  style={inputStyle}
/>
</div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Resume</label>

<input
  value={editData.resume || ""}
  onChange={e => setEditData({...editData, resume: e.target.value})}
  placeholder="Resume Link"
  style={inputStyle}
/>
</div>
<div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Price</label>

<input
  value={editData.price || ""}
  onChange={e => setEditData({...editData, price: e.target.value})}
  placeholder="Session Price"
  style={inputStyle}
/>
</div>
</div>
<div style={{ marginTop:'12px' }}>
        <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Bio</label>
<textarea
        value={editData.bio || ""}
        onChange={e => setEditData({...editData, bio: e.target.value})}
        placeholder="Bio"
        style={inputStyle}
      />
      </div>
      <button
        className="btn-primary"
        style={{ width:'100%', marginTop:'14px' }}
        onClick={async () => {
          const token = localStorage.getItem("token")

          await fetch("http://localhost:8081/api/counselors/me", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(editData)
          })

          // 🔥 UPDATE UI
          setProfile(editData)
          setShowEdit(false)
        }}
      >
        💾 Save
      </button>
    </div>
  </div>
)}

       {activeTab === "profile" && (
  <div className="card" style={{
  background:'rgba(255,255,255,0.03)',
  border:'1px solid rgba(124,58,237,0.2)',
  borderRadius:'12px',
  padding:'14px',
  transition:'all 0.25s ease',
  cursor:'pointer'
}}
onMouseEnter={e=>{
  e.currentTarget.style.transform='translateY(-3px)'
  e.currentTarget.style.boxShadow='0 8px 25px rgba(124,58,237,0.2)'
}}
onMouseLeave={e=>{
  e.currentTarget.style.transform='none'
  e.currentTarget.style.boxShadow='none'
}}>

    <h3 style={{
      fontFamily:'Syne',
      marginBottom:'20px',
      fontSize:'1.2rem',
      textAlign:"center",
    }}>
      👤 Profile Overview
    </h3>
     <div style={{ marginTop:'20px', textAlign:'right' }}>
      <button
        style={{
          padding:'10px 18px',
          borderRadius:'8px',
          border:'none',
          background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
          color:'#fff',
          cursor:'pointer',
          fontWeight:'600'
        }}
        onClick={() => {
          setEditData(profile)
          setShowEdit(true)
        }}
      >
        ✏️ Edit Profile
      </button>
    </div>
    <div style={{
  display:'flex',
  alignItems:'center',
  gap:'16px',
  marginBottom:'24px'
}}>
  <div style={{
    width:'70px',
    height:'70px',
    borderRadius:'50%',
    background:'linear-gradient(135deg,#7c3aed,#4f46e5)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    fontSize:'1.5rem',
    fontWeight:'700'
  }}>
    {profile.name?.charAt(0)}
  </div>

  <div>
    <h2 style={{ margin:0 }}>{profile.name}</h2>
    <p style={{ color:'var(--muted)', margin:'4px 0' }}>
      {profile.title}
    </p>

    <div style={{ display:'flex', gap:'12px', marginTop:'6px' }}>
      <span style={{ color:'#f4a825' }}>⭐ {profile.rating}</span>
      <span style={{ color:'#34d399' }}>📅 {profile.sessions} sessions</span>
    </div>
  </div>
</div>

    {/* GRID LAYOUT */}
    <div style={{
      display:'grid',
      gridTemplateColumns:'repeat(auto-fit, minmax(250px,1fr))',
      gap:'16px'
    }}>

      {[
        {label:"Name", value:profile.name},
        {label:"Email", value:profile.email},
        {label:"Title", value:profile.title},
        {label:"Specialization", value:profile.specialization},
        {label:"Domain", value:profile.domain},
        {label:"Experience", value:profile.exp},
        {label:"Sessions", value:profile.sessions},
        {label:"Rating", value:`⭐ ${profile.rating}`},
        {label:"Price", value:profile.price},
        {label:"Badge", value:profile.badge},
      ].map((item,i)=>(
        <div key={i} style={{
          background:'rgba(255,255,255,0.03)',
          border:'1px solid var(--border)',
          borderRadius:'10px',
          padding:'12px 14px'
        }}>
          <div style={{
            fontSize:'0.72rem',
            color:'var(--muted)',
            marginBottom:'4px',
            textTransform:'uppercase'
          }}>
            {item.label}
          </div>
          <div style={{
            fontWeight:'600',
            fontSize:'0.95rem'
          }}>
            {item.value || "—"}
          </div>
        </div>
      ))}

    </div>

    {/* BIO FULL WIDTH */}
    <div style={{
      marginTop:'18px',
      padding:'14px',
      borderRadius:'10px',
      background:'rgba(255,255,255,0.03)',
      border:'1px solid var(--border)'
    }}>
      <div style={{
        fontSize:'0.75rem',
        color:'var(--muted)',
        marginBottom:'6px',
        textTransform:'uppercase'
      }}>
        Bio
      </div>
      <p style={{ lineHeight:'1.5', margin:0 }}>
        {profile.bio || "No bio added"}
      </p>
    </div>

    {/* SLOTS */}
    <div style={{
      marginTop:'12px',
      padding:'14px',
      borderRadius:'10px',
      background:'rgba(255,255,255,0.03)',
      border:'1px solid var(--border)'
    }}>
      <div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px'
}}>

  {/* LEFT - TITLE */}
  <div style={{
    fontSize:'0.75rem',
    color:'var(--muted)',
    textTransform:'uppercase'
  }}>
    Availability
  </div>

  {/* RIGHT - BUTTON */}
  <button
    style={{
      background: "none",
      border: "none",
      color: "#7c3aed",
      cursor: "pointer",
      fontSize: "0.75rem",
      fontWeight: "600"
    }}
    onClick={() => setActiveTab("calendar")}
  >
    📅 Manage Availability →
  </button>

</div>
      
      
    {Object.keys(groupedSlots).length === 0 ? (
    <span style={{ color:'var(--muted)' }}>No slots added</span>
  ) : (

    Object.entries(groupedSlots).slice(0,3).map(([date, daySlots]) => (

      <div key={date} style={{ marginBottom:'12px' }}>

        {/* DATE HEADER */}
        <div style={{
          fontSize:'0.8rem',
          fontWeight:'600',
          marginBottom:'6px',
          color:'#a78bfa'
        }}>
          📅 {date}
        </div>

        {/* SLOT ROW */}
        <div style={{
          display:'flex',
          gap:'8px',
          overflowX:'auto'
        }}>

          {daySlots.slice(0,4).map(s => (
            <div
              key={s.id}
              style={{
                minWidth:'120px',
                padding:'8px 10px',
                borderRadius:'10px',

                background: s.booked
                  ? 'rgba(239,68,68,0.15)'
                  : 'rgba(34,197,94,0.15)',

                border: '1px solid rgba(255,255,255,0.08)',

                fontSize:'0.75rem',
                textAlign:'center',
                cursor:'pointer',
                transition:'all 0.25s ease'
              }}

              onMouseEnter={e=>{
                e.currentTarget.style.transform='translateY(-3px)'
                e.currentTarget.style.boxShadow='0 6px 20px rgba(124,58,237,0.4)'
              }}

              onMouseLeave={e=>{
                e.currentTarget.style.transform='none'
                e.currentTarget.style.boxShadow='none'
              }}
            >
              {s.time}
              <div style={{
                fontSize:'0.65rem',
                color: s.booked ? '#ef4444' : '#22c55e'
              }}>
                {s.booked ? 'Booked' : 'Free'}
              </div>
            </div>
          ))}

          {/* + MORE */}
          {daySlots.length > 4 && (
            <div
              onClick={() => {
                setSelectedDate(date)
                setShowSlotsPopup(true)
              }}
              style={{
                minWidth:'90px',
                padding:'8px',
                borderRadius:'10px',
                background:'rgba(124,58,237,0.15)',
                color:'#a78bfa',
                fontSize:'0.75rem',
                textAlign:'center',
                cursor:'pointer'
              }}
            >
              +{daySlots.length - 4} more
            </div>
          )}

        </div>

      </div>
    ))
  )}


    </div>

   

  </div>
)}

{showSlotsPopup && (
  <div style={{
    position:'fixed',
    inset:0,
    background:'rgba(0,0,0,0.8)',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    zIndex:9999
  }}
  onClick={()=>setShowSlotsPopup(false)}
  >

    <div style={{
      background:'#0d1e35',
      padding:'20px',
      borderRadius:'14px',
      width:'400px',
      maxHeight:'80vh',
      overflowY:'auto',
      border:'1px solid rgba(124,58,237,0.3)'
    }}
    onClick={e=>e.stopPropagation()}
    >

      <h3 style={{ marginBottom:'12px' }}>
        📅 {selectedDate}
      </h3>

      {groupedSlots[selectedDate]?.map(s => (
        <div key={s.id} style={{
          padding:'10px',
          borderRadius:'8px',
          marginBottom:'8px',
          background: s.booked
            ? 'rgba(239,68,68,0.1)'
            : 'rgba(34,197,94,0.1)'
        }}>
          {s.time} — {s.booked ? '🔴 Booked' : '🟢 Available'}
        </div>
      ))}

    </div>

  </div>
)}

{activeTab === "reviews" && (
  <div>

    {/* HEADER */}
    <h3 style={{
      marginBottom: "20px",
      fontFamily: "Syne",
      fontSize: "1.3rem"
    }}>
      ⭐ Ratings & Reviews
    </h3>

    {/* ===== TOP CARD ===== */}
    <div className="card" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
      padding: "20px"
    }}>
      <div>
        <h1 style={{
          color: "#f4a825",
          fontSize: "2.2rem",
          margin: 0
        }}>
          ⭐ {profile.rating || 0}
        </h1>

        <p style={{ color: "var(--muted)", marginTop: "4px" }}>
          Avg Rating
        </p>
      </div>

      <div style={{ textAlign: "right" }}>
        <h2 style={{ margin: 0 }}>{reviews.length}</h2>
        <p style={{ color: "var(--muted)" }}>Reviews</p>
      </div>
    </div>

    {/* ===== BREAKDOWN ===== */}
    <div className="card" style={{ marginBottom: "20px" }}>
      <h4 style={{ marginBottom: "16px" }}>
        RATING BREAKDOWN
      </h4>

      {[5,4,3,2,1].map(star => {
        const count = reviews.filter(r => r.rating === star).length
        const percent = reviews.length
          ? (count / reviews.length) * 100
          : 0

        return (
          <div key={star} style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "10px",
            gap: "10px"
          }}>
            <span style={{ width: "40px" }}>
              {star}★
            </span>

            {/* BAR */}
            <div style={{
              flex: 1,
              height: "6px",
              borderRadius: "6px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden"
            }}>
              <div style={{
                width: `${percent}%`,
                height: "100%",
                background: "#f4a825",
                transition: "0.4s"
              }} />
            </div>

            <span style={{ width: "20px", textAlign: "right" }}>
              {count}
            </span>
          </div>
        )
      })}
    </div>

    {/* ===== RECENT FEEDBACK ===== */}
    <div className="card">
      <h4 style={{ marginBottom: "16px" }}>
        RECENT STUDENT FEEDBACK
      </h4>

      {reviews.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          No reviews yet
        </p>
      ) : (
        reviews.slice().reverse().map((r, i) => (
          <div key={i} style={{
            padding: "12px 16px",
            marginBottom: "10px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>

            {/* LEFT */}
            <div>
              <b>{r.studentName}</b>

              <div style={{
                fontSize: "0.75rem",
                color: "var(--muted)"
              }}>
                {r.date}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{
              color: "#f4a825",
              fontSize: "0.9rem"
            }}>
              {"★".repeat(r.rating)}
            </div>

          </div>
        ))
      )}
    </div>

  </div>
)}
{popupSession && (
  <div style={popupOverlay}>
    <div style={popupBox}>

      <h3>🚀 Session Starting Soon</h3>

      <p><b>{popupSession.studentName}</b></p>

      <p style={{ color: "#aaa" }}>
        {popupSession.date} · {popupSession.time}
      </p>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        
        {popupSession.meetingLink && (
          <a href={popupSession.meetingLink} target="_blank" style={joinNowBtn}>
            🎥 Join Now
          </a>
        )}

        <button onClick={() => setPopupSession(null)} style={dismissBtn}>
          Dismiss
        </button>

      </div>

    </div>
  </div>
)}
      </div>
      
    </div>
  )
}

const btn = {
  padding: "8px 14px",
  borderRadius: "6px",
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  cursor: "pointer"
}

const btnGreen = { ...btn, background: "#22c55e" }
const btnRed = { ...btn, background: "#ef4444" }
const modernInput = {
  flex: 1,
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.05)",
  color: "#fff"
}

const addBtn = {
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600"
}

const removeBtn = {
  marginTop: "8px",
  padding: "6px 10px",
  fontSize: "0.7rem",
  borderRadius: "6px",
  border: "none",
  background: "rgba(239,68,68,0.2)",
  color: "#ef4444",
  cursor: "pointer"
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
  color: active ? "#f4a825" : "#888"
})

const tabUnderline = {
  position: "absolute",
  bottom: "-6px",
  left: 0,
  height: "2px",
  width: "100%",
  background: "#f4a825"
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