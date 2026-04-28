import { useState, useRef, useEffect } from 'react'
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"


export default function Chat({ auth,counselors }) {
  const [selectedCounselor, setSelectedCounselor] = useState(null)
  const [messages, setMessages] = useState({})
  const [input, setInput] = useState('')
  const [conversations, setConversations] = useState([])
  const [stompClient, setStompClient] = useState(null)
  const [unread, setUnread] = useState({})
  const bottomRef = useRef(null)
  const [typingUser, setTypingUser] = useState(null)
  const selectedRef = useRef(null)
  const [search, setSearch] = useState("")
const [filter, setFilter] = useState("all") // all | unread
const [chatSearch, setChatSearch] = useState("")
const [selectedFile, setSelectedFile] = useState(null)
const [previewUrl, setPreviewUrl] = useState(null)

 

  const currentMsgs = selectedCounselor ? (messages[selectedCounselor.email]|| []) : []
useEffect(() => {
  const client = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8081/ws"),

    reconnectDelay: 5000,

    onConnect: () => {
      console.log("✅ WebSocket Connected")
      
   const interval = setInterval(() => {
  if (client.connected) {
    client.publish({
      destination: "/app/online",
      body: JSON.stringify({
        senderEmail: auth.email
      })
    })
  }
}, 10000) // every 20 sec

client.subscribe("/topic/status", (msg) => {
const [email, status, time] = msg.body.split(":")

  setConversations(prev =>
    prev.map(c => {
      if (c.email !== email) return c

      if (status === "ONLINE") {
        return {
          ...c,
          online: true,
          lastSeen: null
        }
      } else {
        return {
          ...c,
          online: false,
lastSeen: Number(time)

}
      }
    })
  )
})

client.subscribe(`/topic/chat/${auth.email}`, (msg) => {
          const data = JSON.parse(msg.body)
          
  if (
  data.receiverEmail === auth.email &&
  selectedRef.current?.email === data.senderEmail
) {setTimeout(() => {
  client.publish({
    destination: "/app/seen",
    body: JSON.stringify({
      senderEmail: data.senderEmail,
      receiverEmail: auth.email
    })
  })
}, 100)
}

        const otherUser =
          data.senderEmail === auth.email
            ? data.receiverEmail
            : data.senderEmail

        const isActive = selectedRef.current?.email === otherUser

 if (data.senderEmail !== auth.email && !isActive) {
      setUnread(prev => ({
        ...prev,
        [otherUser]: (prev[otherUser] || 0) + 1
      }))
    }

if (isActive) {
  setUnread(prev => ({
    ...prev,
    [otherUser]: 0
  }))
}

setMessages(prev => {
  const existing = prev[otherUser] || []

  const alreadyExists = existing.some(m => m.id === data.id)
  if (alreadyExists) return prev   // 🔥 prevent duplicate

  return {
    ...prev,
    [otherUser]: [
      ...existing,
      {
        id: data.id,
        text: data.message,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        sender: data.senderEmail === auth.email ? "user" : "counselor",
        time: data.time
      }
    ]
  }
})
      })
      client.subscribe(`/topic/typing/${auth.email}`, (msg) => {
    const data = JSON.parse(msg.body)
    setTypingUser(data.senderEmail)
    setTimeout(() => setTypingUser(null), 1500)
  })

  // ✅ SEEN SUBSCRIBE
  client.subscribe(`/topic/seen/${auth.email}`, (msg) => {
    const updatedMessages = JSON.parse(msg.body)
    const data = JSON.parse(msg.body)

const otherUser =
    updatedMessages[0]?.senderEmail === auth.email
      ? updatedMessages[0]?.receiverEmail
      : updatedMessages[0]?.senderEmail
      
  setMessages(prev => ({
    ...prev,
    [otherUser]: updatedMessages.map(m => ({
      id: m.id,
      text: m.message,
       fileUrl: m.fileUrl,
       fileType: m.fileType,
      sender: m.senderEmail === auth.email ? "user" : "counselor",
      time: m.time,
      seen: m.seen,
      delivered: m.delivered
    }))
  }))
})

    },

    onStompError: (err) => {
      console.error("❌ STOMP error:", err)
    }
  })

  client.activate()
  setStompClient(client)

  return () => client.deactivate()
}, [auth.email])
const handleTyping = () => {
  if (!stompClient || !selectedCounselor) return

  stompClient.publish({
    destination: "/app/typing",
    body: JSON.stringify({
      senderEmail: auth.email,
      receiverEmail: selectedCounselor.email
    })
  })
}
 
useEffect(() => {
  const container = bottomRef.current?.parentElement

  if (!container) return

  const isNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 100

  if (isNearBottom) {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }
}, [currentMsgs])

useEffect(() => {
  selectedRef.current = selectedCounselor
}, [selectedCounselor])

useEffect(() => {
  const handleClose = () => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/offline",
        body: JSON.stringify({
          senderEmail: auth.email
        })
      })
    }
  }

  window.addEventListener("beforeunload", handleClose)

  return () => {
    window.removeEventListener("beforeunload", handleClose)
  }
}, [stompClient])

const sendMessage = async () => {
  if (!selectedCounselor || !stompClient) return

  // 🔥 FILE CASE
  if (selectedFile) {
    const formData = new FormData()
    formData.append("file", selectedFile)

    const token = localStorage.getItem("token")

    const res = await fetch("http://localhost:8081/api/chat/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const fileUrl = await res.text()

    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify({
        senderEmail: auth.email,
        receiverEmail: selectedCounselor.email,
        fileUrl,
        fileType: selectedFile.type
      })
    })

    // ✅ CLEAR AFTER SEND
    setSelectedFile(null)
    setPreviewUrl(null)
    return
  }

  // 🔥 TEXT CASE
  if (!input.trim()) return

  stompClient.publish({
    destination: "/app/chat",
    body: JSON.stringify({
      senderEmail: auth.email,
      receiverEmail: selectedCounselor.email,
      message: input.trim()
    })
  })

  setInput("")
}

const loadMessages = async () => {
  if (!selectedCounselor) return

  const token = localStorage.getItem("token")

  const res = await fetch(
    `http://localhost:8081/api/chat/history?user1=${auth.email}&user2=${selectedCounselor.email}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  if (!res.ok) return

  const data = await res.json()

  setMessages(prev => ({
    ...prev,
    [selectedCounselor.email]: data.map(m => ({
      id: m.id,
      text: m.message,
      fileUrl: m.fileUrl,
fileType: m.fileType,
      sender: m.senderEmail === auth.email ? "user" : "counselor",
     time: m.time,
     seen: m.seen,
delivered: m.delivered
    }))
  }))
}
useEffect(() => {
  loadMessages()
}, [selectedCounselor])

useEffect(() => {
  if (!selectedCounselor) return

  setTimeout(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" })
  }, 100)
}, [selectedCounselor])

const isCounselor = auth.role === "counselor"

const loadConversations = async () => {
  const token = localStorage.getItem("token")

  try {
    const res = await fetch(
      `http://localhost:8081/api/chat/conversations?email=${auth.email}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!res.ok) return

    const data = await res.json()
setConversations(
  data.map(email => ({
    email,
    name: email.split("@")[0],
    online: false,
    lastSeen: null
  }))
)
  } catch (err) {
    console.error("❌ Conversations error:", err)
  }
}
useEffect(() => {
  if (!conversations.length) return

conversations.forEach(async (c) => {
  const email = c.email
      const token = localStorage.getItem("token")

    const res = await fetch(
      `http://localhost:8081/api/chat/history?user1=${auth.email}&user2=${email}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    if (!res.ok) return

    const data = await res.json()

    setMessages(prev => ({
      ...prev,
      [email]: data.map(m => ({
        id: m.id,
        text: m.message,
        fileUrl: m.fileUrl,
        fileType: m.fileType,
        sender: m.senderEmail === auth.email ? "user" : "counselor",
        time: m.time,
        seen: m.seen,
delivered: m.delivered
        
      }))
    }))
  })
}, [conversations])

useEffect(() => {
  if (!selectedCounselor || !stompClient) return

  stompClient.publish({
    destination: "/app/seen",
    body: JSON.stringify({
      senderEmail: selectedCounselor.email, // 🔥 FIX
      receiverEmail: auth.email             // 🔥 FIX
    })
  })
}, [selectedCounselor])

useEffect(() => {
  loadConversations()
    loadUnread()   // 🔥 ADD THIS

}, [])

const loadUnread = async () => {
  const token = localStorage.getItem("token")

  const res = await fetch(
    `http://localhost:8081/api/chat/unread?email=${auth.email}`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  )

  if (!res.ok) return

  const data = await res.json()

  setUnread(data) // 🔥 IMPORTANT
}

const sortedList = (auth.role === "user" ? counselors : conversations)
  .map(c => {
    const item = auth.role === "user"
      ? c
      : c

    const lastMsg = messages[item.email]?.slice(-1)[0]

    return {
      ...item,
      lastMsg,
lastTime: lastMsg ? new Date(lastMsg.time) : new Date(0)    }
  })
  .sort((a, b) => b.lastTime - a.lastTime)
const activeUser = selectedCounselor
  ? conversations.find(c => c.email === selectedCounselor.email) || {
      online: false,
      lastSeen: null
    }
  : {
      online: false,
      lastSeen: null
    }


    const formatLastSeen = (time) => {
  if (!time) return "Offline"

  const date = new Date(time)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()

  return isToday
    ? `Last seen today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : `Last seen ${date.toLocaleDateString()}`
}

useEffect(() => {
  const handleVisibility = () => {
    if (!stompClient || !stompClient.connected) return

    if (document.hidden) {
      stompClient.publish({
        destination: "/app/offline",
        body: JSON.stringify({
          senderEmail: auth.email
        })
      })
    } else {
      stompClient.publish({
        destination: "/app/online",
        body: JSON.stringify({
          senderEmail: auth.email
        })
      })
    }
  }

  document.addEventListener("visibilitychange", handleVisibility)

  return () => {
    document.removeEventListener("visibilitychange", handleVisibility)
  }
}, [stompClient])

const filteredList = sortedList
  .filter(c => {
    if (filter === "unread") return unread[c.email] > 0
    return true
  })
  .filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

const groupMessagesByDate = (msgs) => {
  const groups = {}

  msgs.forEach(msg => {
    const date = new Date(msg.time)
    const today = new Date()

    let label = date.toDateString()

    if (date.toDateString() === today.toDateString()) {
      label = "Today"
    } else {
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)

      if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday"
      }
    }

    if (!groups[label]) groups[label] = []
    groups[label].push(msg)
  })

  return groups
}

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh',  overflow: 'hidden' }}>
      <div className="orb orb-1" />
      <div style={{ background: 'rgba(17,34,64,0.4)', borderBottom: '1px solid var(--border)', padding: '28px 0' }}>
        <div className="container">
          <p style={s.eyebrow}>MESSAGES</p>
<h1 className="section-title">
  {auth.role === "counselor" ? "Chat with Students" : "Chat with Counselors"}
</h1>          <p style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Ask questions, get quick guidance before booking a session.</p>
        </div>
      </div>

<div className="container" style={{
  padding: '28px 24px',
  height: 'calc(100vh - 140px)', // adjust navbar height
  overflow: 'hidden'             // 🔥 STOP PAGE SCROLL
}}>          <div style={s.chatLayout}>

          {/* Counselor List */}
          <div style={s.sidebar}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', fontWeight: '700', fontSize: '0.9rem' }}>
              {auth.role === "user" ? "Counselors" : "Students"}
            </div>
            <div style={{ padding: '12px' }}>

  {/* 🔍 Search */}
  <input
    placeholder="Search or start new chat"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: '100%',
      padding: '10px 14px',
      borderRadius: '20px',
      border: 'none',
      background: 'rgba(255,255,255,0.08)',
      color: 'white',
      marginBottom: '10px'
    }}
  />

  {/* 🔥 Filters */}
  <div style={{ display: 'flex', gap: '8px' }}>
    <button
      onClick={() => setFilter("all")}
      style={filter === "all" ? activeBtn : btn}
    >
      All
    </button>

    <button
      onClick={() => setFilter("unread")}
      style={filter === "unread" ? activeBtn : btn}
    >
      Unread {Object.values(unread).reduce((a,b)=>a+b,0)}
    </button>
  </div>

</div>
           {filteredList.map(c => {
            const item = c
  
    const lastMsg = messages[item.email]?.slice(-1)[0]

  return (
   <div
  key={item.email}
  onClick={() => {
    setSelectedCounselor(item)

    // ✅ reset unread
    setUnread(prev => ({
      ...prev,
      [item.email]: 0
    }))
  }}
  style={{
  ...s.counselorItem,
  ...(selectedCounselor?.email === item.email ? s.counselorActive : {}),
  ...(unread[item.email] > 0 ? { background: 'rgba(29,78,216,0.2)',borderLeft: '3px solid #22c55e',fontWeight: unread[item.email] > 0 ? "700" : "500" } : {})
}}
>
      <div style={{ position: 'relative' }}>
        <div style={s.av}>{item.avatar || "👤"}</div>
      </div>

     <div style={{ flex: 1 }}>
  <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>
    {item.name}
  </div>

  {/* 🔥 LAST MESSAGE PREVIEW */}
<div style={{
  fontSize: '0.72rem',
  color: typingUser === item.email ? '#22c55e' : 'var(--muted)'
}}>
  {typingUser === item.email
  ? "typing..."
  : lastMsg?.text
  ? lastMsg.text.slice(0, 25)
  : lastMsg?.fileUrl
    ? "📎 File"
    : "Start chatting..."
}  </div>
</div>

      {unread[item.email] > 0 && (
        <span style={s.msgCount}>
          {unread[item.email]}
        </span>
      )}
    </div>
  )
})}
          </div>

          {/* Chat Window */}
          <div style={s.chatWindow}>
            {!selectedCounselor ? (
              <div style={s.empty}>
                <div style={{ fontSize: '3rem', marginBottom: '14px' }}>💬</div>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Select a counselor to start chatting</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div style={s.chatHeader}>
                  <div style={s.av}>{selectedCounselor.avatar}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{selectedCounselor.name}</div>
                    <div style={{ fontSize: '0.75rem', color: activeUser?.online ? '#22c55e' : 'var(--muted)' }}>
                      {activeUser?.online
  ? '🟢 Online'
  : activeUser?.lastSeen
    ? formatLastSeen(activeUser.lastSeen)
    : 'Offline'}
                      {typingUser === selectedCounselor.email && (
  <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>
    typing...
  </div>
)}
                    </div>
                    
                  </div>
                       <div style={{
  marginLeft: 'auto',   // 🔥 pushes to right
  position: 'relative'
}}>

  {/* 🔍 ICON */}
  <span style={{
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '0.75rem',
    opacity: 0.6
  }}>
    🔍
  </span>

  <input
    placeholder="Search messages..."
    value={chatSearch}
    onChange={(e) => setChatSearch(e.target.value)}
    style={{
      width: '220px',
      padding: '8px 12px 8px 34px', // space for icon
      borderRadius: '20px',

      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',

      color: 'white',
      fontSize: '0.75rem',
      outline: 'none',

      transition: 'all 0.2s ease'
    }}

    onFocus={e => {
      e.target.style.border = '1px solid #22c55e'
      e.target.style.boxShadow = '0 0 0 2px rgba(34,197,94,0.2)'
    }}

    onBlur={e => {
      e.target.style.border = '1px solid rgba(255,255,255,0.08)'
      e.target.style.boxShadow = 'none'
    }}
  />

</div>
             
                </div>
                

                {/* Messages */}
                <div style={s.messages}>
                  {currentMsgs.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem', padding: '40px 20px' }}>
                      Start a conversation with {(selectedCounselor.name || "User").split(' ')[0]}!
                    </div>
                  )}
                  {Object.entries(groupMessagesByDate(
  currentMsgs.filter(msg => {
    if (msg.fileUrl) return true
    return msg.text?.toLowerCase().includes(chatSearch.toLowerCase())
  })
)).map(([date, msgs]) => (

  <div key={date}>

    {/* 📅 DATE HEADER */}
    <div style={{
      textAlign: "center",
      fontSize: "0.7rem",
      margin: "10px 0",
      opacity: 0.6
    }}>
      {date}
    </div>

    {msgs.map(msg => (
      <div
        key={msg.id}
        style={{
          display: 'flex',
          justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
          marginBottom: '10px'
        }}
      >
        
                      {msg.sender === 'counselor' && <div style={{ ...s.av, width: '28px', height: '28px', fontSize: '0.65rem', marginRight: '8px', flexShrink: 0 }}>{selectedCounselor.avatar}</div>}


        <div style={{ ...s.bubble, ...(msg.sender === 'user' ? s.userBubble : s.counselorBubble) }}>


          <div>
            {msg.fileUrl ? (
              msg.fileType?.startsWith("image") ? (
                <img
                  src={msg.fileUrl}
                  style={{
                    maxWidth: "200px",
                    borderRadius: "10px",
                    marginTop: "5px"
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "10px",
                    cursor: "pointer"
                  }}
                  onClick={() => window.open(msg.fileUrl)}
                >
                  <div style={{
                    width: "40px",
                    height: "40px",
                    background: "#ef4444",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold"
                  }}>
                    PDF
                  </div>

                  <div>
                    <div style={{ fontSize: "0.8rem" }}>
                      {msg.fileUrl.split("_").slice(1).join("_")}
                    </div>
                    <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
                      Click to open
                    </div>
                  </div>
                </div>
              )
            ) : (chatSearch
      ? msg.text?.split(new RegExp(`(${chatSearch})`, "gi")).map((part, i) =>
          part.toLowerCase() === chatSearch.toLowerCase()
            ? <mark key={i} style={{ background: "#22c55e", color: "#000" }}>{part}</mark>
            : part
        )
      :msg.text
            )}
          </div>

          <div style={{ fontSize: '0.68rem', opacity: 0.6 }}>
            {new Date(msg.time.replace(" ", "T")).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit"
            })}
            {msg.sender === "user" && (
  <span
  style={{
    marginLeft: "6px",
    color: msg.seen ? "#001530" : "rgba(255, 255, 255, 0.5)", // 🔥 blue + subtle gray
 // 🔥 green/blue feel
    fontWeight: "bold"
  }}
>
  {msg.seen ? "✓✓" : "✓"}
</span>
)}
          </div>

        </div>
      </div>
    ))}

  </div>
))}
                
                  <div ref={bottomRef} />
                </div>
{selectedFile && (
  <div style={{
    position: "relative",   // 🔥 IMPORTANT
    padding: "16px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }}>

    {/* ❌ TOP LEFT BUTTON */}
    <button
      onClick={() => {
        setSelectedFile(null)
        setPreviewUrl(null)
      }}
      style={{
        position: "absolute",
        top: "8px",
        left: "8px",
        width: "22px",
        height: "22px",
        borderRadius: "50%",
        border: "none",
        background: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: "12px",
        cursor: "pointer"
      }}
    >
      ✕
    </button>

    {/* IMAGE */}
    {previewUrl ? (
      <img
        src={previewUrl}
        style={{
          width: "70px",
          height: "70px",
          objectFit: "cover",
          borderRadius: "10px"
        }}
      />
    ) : (
      <div style={{
        width: "70px",
        height: "70px",
        borderRadius: "10px",
        background: "rgba(255,255,255,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        📄
      </div>
    )}

    {/* INFO */}
    <div style={{ marginLeft: "10px" }}>
      <div style={{ fontSize: "0.85rem" }}>{selectedFile.name}</div>
      <div style={{ fontSize: "0.7rem", opacity: 0.6 }}>
        {(selectedFile.size / 1024).toFixed(1)} KB
      </div>
    </div>
  </div>
)}
                {/* Input */}
                <div style={s.inputRow}>
                  <input value={input}onChange={(e) => {
  setInput(e.target.value)
  handleTyping()
}}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={`Message ${selectedCounselor.name.split(' ')[0]}...`}
                    style={s.input} />
                   <button
  onClick={() => document.getElementById("fileInput").click()}
  style={{
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border: "none",

    display: "flex",              // 🔥 IMPORTANT
    alignItems: "center",         // vertical center
    justifyContent: "center",     // horizontal center

    background: "rgba(255,255,255,0.08)",
    color: "#fff",

    fontSize: "34px",             // 🔥 reduce size
    lineHeight: "1",              // 🔥 fix vertical shift

    cursor: "pointer",
    transition: "0.2s"
  }}
  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
>
<span style={{ transform: "translateY(-1px)" }}>+</span>
</button>
                    <input
  type="file"
  accept="*"
  id="fileInput"
  style={{ display: "none" }}
onChange={(e) => {
  const file = e.target.files[0]
  if (!file) return

  setSelectedFile(file)

  // preview for image
  if (file.type.startsWith("image")) {
    setPreviewUrl(URL.createObjectURL(file))
  } else {
    setPreviewUrl(null)
  }
}}/>
                  <button onClick={sendMessage} className="btn-primary" style={{ padding: '12px 20px', borderRadius: '10px', flexShrink: 0 }}>
                    Send →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s = {
  eyebrow: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--purple-light)', textTransform: 'uppercase', marginBottom: '12px' },
  chatLayout: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: '0', background: 'var(--card-bg)', border: '1px solid var(--border-light)', borderRadius: '16px', overflow: 'hidden', height: '100%' },
  sidebar: { borderRight: '1px solid var(--border-light)', overflowY: 'auto',height:'100%',minHeight: 0  },
  counselorItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' },
  counselorActive: { background: 'rgba(29,78,216,0.15)' },
  av: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d4ed8,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.8rem', flexShrink: 0 },
  onlineDot: { position: 'absolute', bottom: '1px', right: '1px', width: '9px', height: '9px', borderRadius: '50%', border: '2px solid #0d1e35' },
  msgCount: { background: 'var(--purple-light)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.7rem', fontWeight: '700' },
  chatWindow: {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden'
},
  chatHeader: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', borderBottom: '1px solid var(--border-light)', background: 'rgba(10,22,40,0.5)',justifyContent: 'space-between'  },
  messages: { flex: 1, overflowY: 'auto', padding: '16px 18px',minHeight: 0 ,maxHeight:'100%',scrollBehavior: 'smoooth' },
  bubble: { maxWidth: '65%', padding: '10px 14px', borderRadius: '14px', fontSize: '0.88rem', lineHeight: '1.5' },
  userBubble: { background: 'linear-gradient(135deg,#1d4ed8,#60a5fa)', color: 'white', borderBottomRightRadius: '4px' },
  counselorBubble: { background: 'rgba(255,255,255,0.07)', border: '1px solid var(--border-light)', color: 'var(--white)', borderBottomLeftRadius: '4px' },
  inputRow: { display: 'flex', gap: '10px', padding: '14px 18px', borderTop: '1px solid var(--border-light)', background: 'rgba(10,22,40,0.5)' },
  input: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '11px 16px', color: 'var(--white)', fontSize: '0.9rem', outline: 'none', fontFamily: 'var(--font-body)' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' },
}
const btn = {
  padding: '6px 12px',
  borderRadius: '20px',
  border: 'none',
  background: 'rgba(255,255,255,0.08)',
  color: 'white',
  cursor: 'pointer',
  fontSize: '0.75rem'
}

const activeBtn = {
  ...btn,
  background: '#22c55e', // green like WhatsApp
  color: '#000',
  fontWeight: '600'
}