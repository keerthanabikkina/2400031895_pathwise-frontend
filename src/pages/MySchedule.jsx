import { useEffect, useState } from "react"
import CalendarView from "./CalendarView"

export default function MySchedule() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [view, setView] = useState("list")
  const [tab, setTab] = useState("upcoming") // 🔥 NEW
  const [reschedule, setReschedule] = useState(null)
  const [newDate, setNewDate] = useState(null)
const [newTime, setNewTime] = useState(null)
const [rescheduleSlots, setRescheduleSlots] = useState([])
const [nowTime, setNowTime] = useState(new Date())

useEffect(() => {
  const interval = setInterval(() => {
    setNowTime(new Date())
  }, 1000)

  return () => clearInterval(interval)
}, [])

useEffect(() => {
  if (!reschedule) return

  const loadSlots = async () => {
    const token = localStorage.getItem("token")

    const res = await fetch(
      `http://localhost:8081/api/slots/${reschedule.counselorId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await res.json()

    // 🔥 only available slots
    setRescheduleSlots(data.filter(s => !s.booked))
  }

  loadSlots()
}, [reschedule])
  useEffect(() => {
    load()
  }, [])
const getMeetingStatus = (date, time) => {
  const sessionTime = parseDateTime(date, time)
  const diff = sessionTime - nowTime

  if (diff > 15 * 60 * 1000) return "not_ready"     // ❌ no join
  if (diff > 0) return "ready"                      // ✅ join available (15 min before)
  if (diff > -60 * 60 * 1000) return "live"         // ✅ during meeting
  return "ended"                                   // 🔴 after 1 hour
}

const getCountdown = (date, time) => {
  const sessionTime = parseDateTime(date, time)
  const diff = sessionTime - nowTime

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
      const absDays = Math.abs(days)
      if (absDays > 0) return `Expired ${absDays} day(s) ago`
      return `Expired`
    }
  }

  const load = async () => {
    const token = localStorage.getItem("token")
    const user = JSON.parse(localStorage.getItem("user"))

    const url =
      user?.role === "counselor"
        ? "http://localhost:8081/api/appointments/counselor"
        : "http://localhost:8081/api/appointments/my"

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })

    let data = await res.json()

    const now = new Date()

    data = data.map(a => {
      const sessionDate = parseDateTime(a.date, a.time)

      if (a.status === "pending" && sessionDate < now) {
        return { ...a, status: "expired" }
      }

      return a
    })

    setAppointments(data)
  }

  const counts = {
    pending: appointments.filter(a => a.status === "pending").length,
    accepted: appointments.filter(a => a.status === "accepted").length,
    expired: appointments.filter(a => a.status === "expired").length,
    rejected: appointments.filter(a => a.status === "rejected").length
  }

  const sorted = [...appointments].sort((a, b) => {
    const order = { pending: 1, accepted: 2, expired: 3, rejected: 4 }
    return order[a.status] - order[b.status]
  })

  const now = new Date()

  // 🔥 TAB FILTER (Upcoming / Past)
  const tabFiltered = sorted.filter(a => {
  const sessionDate = parseDateTime(a.date, a.time)
  const current = new Date()

  return tab === "upcoming"
    ? sessionDate >= current
    : sessionDate < current
})

  // 🔥 FINAL FILTER
  const finalData = tabFiltered.filter(a => {
    const name = a.counselorName || a.studentName || ""
    return (
      (filter === "all" || a.status === filter) &&
      name.toLowerCase().includes(search.toLowerCase())
    )
  })

  const confirmReschedule = async () => {
  if (!newDate || !newTime) {
    alert("Please select a slot")
    return
  }

  const token = localStorage.getItem("token")

  await fetch(
    `http://localhost:8081/api/appointments/${reschedule.id}/reschedule`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        date: newDate,
        time: newTime
      })
    }
  )

  setReschedule(null)
  setNewDate(null)
  setNewTime(null)
  load()
}
body: JSON.stringify({
  date: newDate,
  time: newTime
})

const groupedSlots = rescheduleSlots.reduce((acc, slot) => {
  if (!acc[slot.date]) acc[slot.date] = []
  acc[slot.date].push(slot)
  return acc
}, {})
  return (
    <div style={{ paddingTop: "100px", maxWidth: "1100px", margin: "auto" }}>

      {/* HEADER */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          📅 My Sessions
          <span style={{
            fontSize: "0.8rem",
            background: "#7c3aed",
            color: "#fff",
            padding: "3px 10px",
            borderRadius: "10px"
          }}>
            {finalData.length}
          </span>
        </h2>

        {/* VIEW SWITCH */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setView("list")} style={btn(view === "list")}>List</button>
          <button onClick={() => setView("calendar")} style={btn(view === "calendar")}>Calendar</button>
        </div>
      </div>

      {/* 🔥 TABS */}
      <div style={tabContainer}>
  {["upcoming", "past"].map(t => (
    <button
      key={t}
      onClick={() => setTab(t)}
      style={tabBtn(tab === t)}
    >
      {t.toUpperCase()}
      {tab === t && <div style={tabUnderline} />}
    </button>
  ))}
</div>

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <CalendarView appointments={appointments} />
      )}

      {/* LIST VIEW */}
      {view === "list" && (
        <>
          {/* FILTER */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
            {["all", "pending", "accepted", "expired", "rejected"].map(f => (
              <button key={f}
                onClick={() => setFilter(f)}
                style={chip(filter === f)}
              >
                {f} {f !== "all" && `(${counts[f]})`}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <input
            placeholder="🔍 Search sessions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={searchBox}
          />

          {/* LIST */}
          {finalData.length === 0 ? (
            <p>No sessions found</p>
          ) : (
            finalData.map(a => {
              const dateObj = parseDateTime(a.date, a.time)

              return (
<div
  key={a.id}
  style={card}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = "translateY(-4px)"
    e.currentTarget.style.boxShadow = "0 10px 30px rgba(124,58,237,0.3)"
    e.currentTarget.style.border = "1px solid rgba(124,58,237,0.4)"
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = "none"
    e.currentTarget.style.boxShadow = "none"
    e.currentTarget.style.border = "1px solid rgba(124,58,237,0.15)"
  }}
>
                  {/* LEFT */}
                  <div>
                    <h4>{a.counselorName || a.studentName}</h4>
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
      {/* 🔄 Reschedule always visible */}
      <button onClick={() => setReschedule(a)} style={resBtn}>
        🔄 Reschedule
      </button>

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
 {/* ✅ 15 MIN BEFORE */}
      {status === "ready" && (
        <>
          <div style={{
            fontSize: "0.7rem",
            color: "#f4a825",
            marginTop: "4px"
          }}>
            ⏳ Starting soon ({getCountdown(a.date, a.time)})
          </div>

          {a.meetingLink && (
            <a
              href={a.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                marginTop: "6px",
                padding: "7px 12px",
                borderRadius: "10px",
                background: "#22c55e",
                color: "#fff",
                fontSize: "0.8rem",
                fontWeight: "600",
                textDecoration: "none"
              }}
            >
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
      fontWeight: "600",
      display: "flex",
      alignItems: "center",
      gap: "4px"
    }}>
      🟢 Live • Join now
    </div>

    {a.meetingLink && (
      <a
        href={a.meetingLink}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          marginTop: "6px",
          padding: "7px 12px",
          borderRadius: "10px",
          background: "linear-gradient(135deg,#22c55e,#16a34a)",
          color: "#fff",
          fontSize: "0.8rem",
          fontWeight: "600",
          textDecoration: "none",
          boxShadow: "0 0 12px rgba(34,197,94,0.6)",
          animation: "pulse 1.5s infinite"
        }}
      >
        🎥 Join Meeting
      </a>
    )}
  </>
)}
      {/* 🔴 ENDED */}
      {status === "ended" && (
  <div style={{
    marginTop: "6px",
    fontSize: "0.75rem",
    color: "#ef4444",
    fontWeight: "500"
  }}>
    🔴 Session finished
  </div>
)}
    </>
  )
})()}
                  </div>

                </div>
              )
            })
          )}
        </>
      )}

      {/* MODAL */}
      {reschedule && (
        <div style={overlay} onClick={() => setReschedule(null)}>
          <div style={modal} onClick={e => e.stopPropagation()}>
<h3 style={{ marginBottom: "10px" }}>
  🔄 Reschedule Session
</h3>

<p style={{
  fontSize: "0.8rem",
  color: "#aaa",
  marginBottom: "10px"
}}>
  Select a new available time slot
</p>
           {Object.keys(groupedSlots).map(date => (
  <div key={date} style={{ marginBottom: "15px" }}>
    
    {/* 📅 DATE HEADER */}
    <div style={{
      fontWeight: "600",
      marginBottom: "8px",
      color: "#a78bfa"
    }}>
      📅 {date}
    </div>

    {/* ⏰ TIME SLOTS */}
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {groupedSlots[date].map(slot => {
        const active =
          newDate === slot.date && newTime === slot.time

        return (
          <button
            key={slot.id}
            onClick={() => {
              setNewDate(slot.date)
              setNewTime(slot.time)
            }}
            style={{
              padding: "8px 12px",
              borderRadius: "20px",
              border: "1px solid #7c3aed",
              background: active
                ? "#7c3aed"
                : "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: "0.8rem",
              cursor: "pointer",
              transition: "0.2s"
            }}
          >
            🟢 {slot.time}
          </button>
        )
      })}
    </div>
  </div>
))}

<button onClick={confirmReschedule} style={confirmBtn}>
  Confirm
</button>          </div>
        </div>
      )}
    </div>
  )
}

/* STYLES */

const btn = (active) => ({
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: active ? "#7c3aed" : "#eee",
  color: active ? "#fff" : "#000"
})

const chip = (active) => ({
  padding: "6px 14px",
  borderRadius: "20px",
  border: "none",
  cursor: "pointer",
  background: active ? "#7c3aed" : "#eee",
  color: active ? "#fff" : "#000"
})

const searchBox = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "20px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: "#fff",
  outline: "none"
}
const card = {
  marginBottom: "15px",
  padding: "18px",
  borderRadius: "14px",
  background: "rgba(20,30,60,0.6)",
  border: "1px solid rgba(124,58,237,0.15)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  transition: "all 0.25s ease",
  cursor: "pointer"
}

const statusStyle = (status) => ({
  display: "block",
  marginBottom: "8px",
  padding: "6px 14px",
  borderRadius: "20px",
  fontWeight: "600",
  backdropFilter: "blur(6px)",
  background:
    status === "accepted"
      ? "rgba(34,197,94,0.15)"
      : status === "rejected"
      ? "rgba(239,68,68,0.15)"
      : status === "expired"
      ? "rgba(120,120,120,0.2)"
      : "rgba(244,168,37,0.15)",
  color:
    status === "accepted"
      ? "#22c55e"
      : status === "rejected"
      ? "#ef4444"
      : status === "expired"
      ? "#999"
      : "#f4a825"
})

const resBtn = {
  padding: "5px 10px",
  borderRadius: "8px",
  border: "none",
  cursor: "pointer",
  background: "#7c3aed",
  color: "#fff",
  fontSize: "0.8rem"
}

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
}

const modal = {
  background: "#0d1e35",
  padding: "20px",
  borderRadius: "12px",
  width: "300px"
}

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px"
}

const confirmBtn = {
  width: "100%",
  padding: "10px",
  background: "#7c3aed",
  color: "#fff",
  border: "none"
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
  fontSize: "0.9rem",
  letterSpacing: "0.5px",
  color: active ? "#8b5cf6" : "#888",
  transition: "all 0.3s ease"
})

const tabUnderline = {
  position: "absolute",
  bottom: "-6px",
  left: 0,
  height: "2px",
  width: "100%",
  background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
  borderRadius: "2px"
}
