import { useState, useMemo ,useEffect} from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'
import { apiGetAllUsers, apiAddUser,apiAddCounselor,apiGetCounselorsAdmin } from '../api'

const CAREER_SEARCH_DATA = [
  { career: 'Software Engineer', searches: 412 },
  { career: 'Data Scientist', searches: 338 },
  { career: 'Product Manager', searches: 267 },
  { career: 'MBBS / Doctor', searches: 244 },
  { career: 'Cybersecurity', searches: 189 },
]
const MONTHLY_DATA = [
  { month: 'Oct', sessions: 12, students: 8 },
  { month: 'Nov', sessions: 19, students: 14 }, 
  { month: 'Dec', sessions: 15, students: 11 },
  { month: 'Jan', sessions: 28, students: 22 },
  { month: 'Feb', sessions: 35, students: 28 },
  { month: 'Mar', sessions: 42, students: 34 },
]
const SESSION_TYPES = [
  { name: 'Career Discovery', value: 35, color: '#60a5fa' },
  { name: 'Pathway Guidance', value: 28, color: '#a78bfa' },
  { name: 'Resume Review', value: 20, color: '#34d399' },
  { name: 'Mock Interview', value: 17, color: '#f59e0b' },
]
const emptyC = { name:'',title:'',specialization:'Technology',domain:'BTech / Engineering',exp:'',bio:'',slots:'' }

export default function AdminDashboard({ adminEmail }) {
  const [tab, setTab] = useState('overview')
  const [showAdd, setShowAdd] = useState(false)
  const [newC, setNewC] = useState(emptyC)
  const [searchUser, setSearchUser] = useState('')
  const [blockList, setBlockList] = useState([])
  const [exportMsg, setExportMsg] = useState('')
  const [showAddUser, setShowAddUser] = useState(false)
const [newUser, setNewUser] = useState({ name:'', email:'', password:'' })
  const [dbUsers, setDbUsers] = useState([])
  const [counselors, setCounselors] = useState([])
  const [showEdit, setShowEdit] = useState(false)
const [editCounselor, setEditCounselor] = useState(null)
const [loadingUsers, setLoadingUsers] = useState(true)
const [allAppointments, setAllAppointments] = useState([])
const [allFeedback, setAllFeedback] = useState([])
useEffect(() => {
  const loadAdminData = async () => {
    const token = localStorage.getItem("token")

    try {
      // ✅ FETCH APPOINTMENTS
      const apptRes = await fetch("http://localhost:8081/api/admin/appointments", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const apptData = await apptRes.json()
      console.log("APPOINTMENTS:", apptData)
      setAllAppointments(apptData)

      // ✅ FETCH FEEDBACK
      const fbRes = await fetch("http://localhost:8081/api/admin/feedback", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      const fbData = await fbRes.json()
      console.log("FEEDBACK:", fbData)
      setAllFeedback(fbData)

    } catch (err) {
      console.error("❌ Admin data error:", err)
    }
  }

  loadAdminData()
}, [])
const updateStatus = async (id, status) => {
  const token = localStorage.getItem("token")

  await fetch(`http://localhost:8081/api/appointments/${id}/status`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  })

  // refresh UI
  setAllAppointments(prev =>
    prev.map(a => a.id === id ? { ...a, status } : a)
  )
}
useEffect(() => {
  const loadUsers = async () => {
    const token = localStorage.getItem("token")

    if (!token) {
      console.error("❌ No token")
      setLoadingUsers(false)
      return
    }

    const res = await apiGetAllUsers(token)

    console.log("USERS API RESPONSE:", res)

    // ✅ FIX HERE
    if (Array.isArray(res)) {
      setDbUsers(res)
    } else {
      console.error("❌ Invalid response:", res)
      setDbUsers([])
    }

    setLoadingUsers(false)
  }

  loadUsers()
}, [])
useEffect(() => {
  const loadCounselors = async () => {
    const token = localStorage.getItem("token")

    const res = await apiGetCounselorsAdmin(token)
    console.log("COUNSELORS:", res)

    if (Array.isArray(res)) {
      setCounselors(res)
    }
  }

  loadCounselors()
}, [])
const deleteFeedback = async (id) => {
  const token = localStorage.getItem("token")

  await fetch(`http://localhost:8081/api/admin/feedback/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  setAllFeedback(prev => prev.filter(f => f.id !== id))
}
const handleAddUser = async () => {
  const token = localStorage.getItem("token")

  console.log("Adding user:", newUser)

  const res = await apiAddUser(newUser, token)

  console.log("ADD USER RESPONSE:", res)

  if (res && !res.error) {
    setDbUsers(prev => [...prev, res])
    setShowAddUser(false)
    setNewUser({ name: '', email: '', password: '' })
  } else {
    alert(res?.error || "Error adding user")
  }
}
  const avgRating = allFeedback.length > 0 ? (allFeedback.reduce((s,f)=>s+f.rating,0)/allFeedback.length).toFixed(1) : 'N/A'

  const counselorStats = useMemo(() => counselors.map(c => {
    const cf =allFeedback.filter(f => f.counselorName === c.name)
    const cs = allAppointments.filter(a => a.counselorId === c.id)
    const avg = cf.length > 0 ? (cf.reduce((s,f)=>s+f.rating,0)/cf.length).toFixed(1) : c.rating
    return { ...c, avgRating: avg, totalSessions: cs.length + c.sessions, feedbackCount: cf.length,
      ratingBreakdown: [5,4,3,2,1].map(star=>({ star, count: cf.filter(f=>f.rating===star).length })),
      recentFeedback: cf.slice(-3) }
  }).sort((a,b) => b.avgRating - a.avgRating), [counselors,allFeedback,allAppointments])

  const topCounselor = counselorStats[0]

  const handleAdd = async () => {
  const token = localStorage.getItem("token")

  if (!token) {
    alert("Not authorized")
    return
  }

  if (!newC.name || !newC.title || !newC.bio) {
    alert("Please fill required fields")
    return
  }

  // 🔥 ADD EMAIL + PASSWORD (IMPORTANT)
  const payload = {
    ...newC,
    email: newC.email || `${newC.name.replace(/\s/g,'').toLowerCase()}@cf.com`,
    password: newC.password || "1234"
  }

  console.log("ADDING COUNSELOR:", payload)

  const res = await apiAddCounselor(payload, token)

  console.log("COUNSELOR RESPONSE:", res)

  if (res && !res.error) {
    alert("✅ Counselor added")

    // reload page OR fetch again (better later)
setCounselors(prev => [...prev, {
  id: res.counselorId,
  ...payload
}])  } else {
    alert(res?.error || "Error adding counselor")
  }
}

  const exportCSV = () => {
    const rows=[['Name','Email','Joined','Sessions','Status'],
      ...dbUsers.map(u=>[u.name,u.email,u.joinedAt,allAppointments.filter(a=>a.studentEmail===u.email).length,u.blocked?'blocked':'active'])]
    const blob=new Blob([rows.map(r=>r.join(',')).join('\n')],{type:'text/csv'})
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='students.csv';a.click()
    setExportMsg('✅'); setTimeout(()=>setExportMsg(''),2000)
  }
const filteredUsers = dbUsers
  .filter(u => u.role === "USER")   // ✅ IMPORTANT FIX
  .filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  )

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
    <div style={{ paddingTop:'88px', minHeight:'100vh', position:'relative' }}>
      <div className="orb orb-1" />
      <div style={{ background:'rgba(183, 105, 234, 0.5)', borderBottom:'1px solid var(--border)', padding:'24px 0' }}>
        <div className="container" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <p style={{ color:'#2925f4', fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'4px' }}>Admin Panel</p>
            <h1 style={{ fontFamily:'Syne, sans-serif', fontSize:'1.7rem' }}>PathWise Administration</h1>
            <p style={{ color:'var(--muted)', fontSize:'0.82rem' }}>Logged in as: <span style={{ color:'var(--purple-light)' }}>{adminEmail}</span></p>
          </div>
          <div style={{ color:'#11c246', fontSize:'0.83rem' }}>● All systems operational</div>
        </div>
      </div>

      <div style={{ borderBottom:'1px solid var(--border)', background:'rgba(10,22,40,0.5)' }}>
<div
  className="container"
  style={{
    display: 'flex',
    justifyContent: 'center', // 🔥 CENTER
    maxWidth: '1100px',
    margin: '0 auto',
  }}
>              {['overview','analytics','counselors','users','sessions','allFeedback'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:'13px 18px', background:'none', border:'none', fontSize:'0.87rem', cursor:'pointer', borderBottom:`2px solid ${tab===t?'#f4a825':'transparent'}`, color:tab===t?'#f4a825':'var(--muted)', whiteSpace:'nowrap' }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
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
        {tab==='overview' && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:'14px', marginBottom:'24px' }}>
              {[{l:'Total Students',v: dbUsers.filter(u=>u.role==="USER").length,i:'👩‍🎓',c:'var(--purple-light)'},
                {l:'Sessions Booked',v:allAppointments.length,i:'📅',c:'#ff8e8e'},
                {l:'Active Counselors',v:counselors.length,i:'👨‍💼',c:'#b39ddb'},
                {l:'Avg Rating',v:avgRating,i:'⭐',c:'#f4a825'}].map((s,i)=>(
                <div key={i} className="card" style={{ borderLeft:`3px solid ${s.c}`, textAlign:'center' }}>
                  <div style={{ fontSize:'1.8rem', marginBottom:'8px' }}>{s.i}</div>
                  <div style={{ fontSize:'2rem', fontWeight:'700', fontFamily:'Syne,sans-serif', color:s.c }}>{s.v}</div>
                  <div style={{ color:'var(--muted)', fontSize:'0.83rem' }}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
              <div className="card">
                <h3 style={{ fontWeight:'700', marginBottom:'16px' }}>📊 Monthly Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={MONTHLY_DATA}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                    <YAxis tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                    <Tooltip contentStyle={{ background:'#0d1e35', border:'1px solid rgba(29,78,216,0.3)', borderRadius:'8px', color:'#eef2ff' }} />
                    <Bar dataKey="sessions" fill="#60a5fa" radius={[4,4,0,0]} name="Sessions" />
                    <Bar dataKey="students" fill="#a78bfa" radius={[4,4,0,0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h3 style={{ fontWeight:'700', marginBottom:'16px' }}>🍩 Session Types</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={SESSION_TYPES} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                      {SESSION_TYPES.map((e,i)=><Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#0d1e35', border:'1px solid rgba(29,78,216,0.3)', borderRadius:'8px', color:'#eef2ff' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize:'0.75rem', color:'#7b8bad' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {topCounselor && (
              <div className="card" style={{ background:'linear-gradient(135deg,rgba(29,78,216,0.1),rgba(167,139,250,0.08))', border:'1px solid rgba(29,78,216,0.3)' }}>
                <h3 style={{ fontWeight:'700', marginBottom:'12px' }}>🏆 Top Rated Counselor</h3>
                <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                  <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'1rem' }}>{topCounselor.avatar}</div>
                  <div>
                    <div style={{ fontWeight:'700', fontSize:'1.05rem' }}>{topCounselor.name}</div>
                    <div style={{ color:'var(--muted)', fontSize:'0.83rem' }}>{topCounselor.title}</div>
                    <div style={{ display:'flex', gap:'16px', marginTop:'6px' }}>
                      <span style={{ color:'#f4a825', fontWeight:'700' }}>⭐ {topCounselor.avgRating}/5</span>
                      <span style={{ color:'var(--muted)', fontSize:'0.83rem' }}>{topCounselor.totalSessions} sessions</span>
                      <span style={{ color:'var(--muted)', fontSize:'0.83rem' }}>{topCounselor.feedbackCount} reviews</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab==='analytics' && (
          <div>
            <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'24px' }}>📈 Analytics Dashboard</h3>
            <div className="card" style={{ marginBottom:'20px' }}>
              <h4 style={{ fontWeight:'700', marginBottom:'16px' }}>Growth Trend (6 Months)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={MONTHLY_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                  <YAxis tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                  <Tooltip contentStyle={{ background:'#0d1e35', border:'1px solid rgba(29,78,216,0.3)', borderRadius:'8px', color:'#eef2ff' }} />
                  <Line type="monotone" dataKey="sessions" stroke="#60a5fa" strokeWidth={2} dot={{ fill:'#60a5fa',r:4 }} name="Sessions" />
                  <Line type="monotone" dataKey="students" stroke="#a78bfa" strokeWidth={2} dot={{ fill:'#a78bfa',r:4 }} name="Students" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
              <div className="card">
                <h4 style={{ fontWeight:'700', marginBottom:'16px' }}>🔍 Most Searched Careers</h4>
                {CAREER_SEARCH_DATA.map((d,i)=>(
                  <div key={i} style={{ marginBottom:'12px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                      <span style={{ fontSize:'0.88rem', fontWeight:'600' }}>#{i+1} {d.career}</span>
                      <span style={{ color:'var(--muted)', fontSize:'0.8rem' }}>{d.searches}</span>
                    </div>
                    <div style={{ height:'5px', background:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ width:`${(d.searches/CAREER_SEARCH_DATA[0].searches)*100}%`, height:'100%', background:i===0?'#60a5fa':i===1?'#a78bfa':'#f59e0b', borderRadius:'3px' }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h4 style={{ fontWeight:'700', marginBottom:'16px' }}>⭐ Counselor Ratings</h4>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={counselorStats.map(c=>({ name:c.avatar, rating:parseFloat(c.avgRating) }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                    <YAxis domain={[0,5]} tick={{ fill:'#7b8bad', fontSize:11 }} axisLine={false} />
                    <Tooltip contentStyle={{ background:'#0d1e35', border:'1px solid rgba(29,78,216,0.3)', borderRadius:'8px', color:'#eef2ff' }} />
                    <Bar dataKey="rating" fill="#f59e0b" radius={[4,4,0,0]} name="Avg Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab==='counselors' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h3 style={{ fontFamily:'Syne,sans-serif' }}>👨‍💼 Counselor Performance ({counselors.length})</h3>
              <button className="btn-primary" style={{ padding:'10px 20px', fontSize:'0.9rem' }} onClick={()=>setShowAdd(true)}>+ Add Counselor</button>
            </div>
            {counselorStats.map((c,idx)=>(
              <div key={c.id} className="card" style={{ marginBottom:'16px' }}>
                <div style={{ display:'flex', gap:'16px', alignItems:'flex-start', flexWrap:'wrap' }}>
                  <div style={{ position:'relative' }}>
                    <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'linear-gradient(135deg,#1d4ed8,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'700', fontSize:'1rem' }}>{c.avatar}</div>
                    {idx===0 && <span style={{ position:'absolute', top:'-10px', left:'50%', transform:'translateX(-50%)', fontSize:'1rem' }}>🏆</span>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                      <div>
                        <div style={{ fontWeight:'700', fontSize:'1rem' }}>{c.name}</div>
                        <div style={{
  position: 'absolute',
  top: '10px',
  left: '50%',
  transform: 'translateX(-50%)',
  textAlign: 'center'
}}>
  


  {/* STATUS */}
  <div style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: '10px',
    fontSize: '0.7rem',
    fontWeight: '600',
    background: c.blocked 
      ? 'rgba(239,68,68,0.1)' 
      : 'rgba(100,255,218,0.1)',
    color: c.blocked ? '#ef4444' : '#64ffda',
    marginBottom: '4px'
  }}>
    {c.blocked ? 'Blocked' : 'Active'}
  </div>

  {/* EMAIL */}
  <div style={{
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: '0.3px'
  }}>
    {c.email || "no-email"}
  </div>

</div>
<div style={{
  position:'absolute',
  top:'5px',
  right:'12px'
}}>
  <button
  onClick={() => {
    setEditCounselor(c)
    setShowEdit(true)
  }}
  style={{
    background:'none',
    border:'1px solid var(--border)',
    borderRadius:'6px',
    color:'#60a5fa',
    padding:'5px 12px',
    cursor:'pointer',
    fontSize:'0.75rem',
    marginRight:'6px'
  }}
>
  ✏️ Edit
</button>
  <button
    onClick={async () => {
      const token = localStorage.getItem("token")

      await fetch(`http://localhost:8081/api/admin/users/${c.userId}/block`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // reload counselors
      const updated = await apiGetCounselorsAdmin(token)
      setCounselors(updated)
    }}
    
    style={{
      background:'none',
      border:'1px solid var(--border)',
      borderRadius:'6px',
      color: c.blocked ? '#64ffda' : '#ef4444',
      padding:'5px 12px',
      cursor:'pointer',
      fontSize:'0.75rem'
    }}
  >
    {c.blocked ? '🔓 Unblock' : '🔒 Block'}
  </button>

</div>
                        <div style={{ color:'var(--muted)', fontSize:'0.82rem' }}>{c.title} · {c.specialization}</div>
                      </div>
                      <div style={{ display:'flex', gap:'16px' ,marginTop:'14px'}}>
                        {[{v:`⭐ ${c.avgRating}`,l:'Avg Rating',c:'#f4a825'},{v:c.totalSessions,l:'Sessions',c:'var(--purple-light)'},{v:c.feedbackCount,l:'Reviews',c:'#34d399'}].map((s,i)=>(
                          <div key={i} style={{ textAlign:'center' }}>
                            <div style={{ color:s.c, fontWeight:'700', fontSize:'1.1rem' }}>{s.v}</div>
                            <div style={{ color:'var(--muted)', fontSize:'0.72rem' }}>{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop:'12px' }}>
                      <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:'700', marginBottom:'6px', textTransform:'uppercase' }}>Rating Breakdown</div>
                      {[5,4,3,2,1].map(star=>{
                        const count=c.ratingBreakdown.find(r=>r.star===star)?.count||0
                        return (
                          <div key={star} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                            <span style={{ color:'#f4a825', fontSize:'0.75rem', width:'20px' }}>{star}★</span>
                            <div style={{ flex:1, height:'5px', background:'rgba(255,255,255,0.07)', borderRadius:'3px', overflow:'hidden' }}>
                              <div style={{ width:`${c.feedbackCount?((count/c.feedbackCount)*100):0}%`, height:'100%', background:'#f4a825', borderRadius:'3px' }} />
                            </div>
                            <span style={{ color:'var(--muted)', fontSize:'0.72rem', width:'16px' }}>{count}</span>
                          </div>
                        )
                      })}
                    </div>
                    {c.recentFeedback.length>0 && (
                      <div style={{ marginTop:'10px', borderTop:'1px solid var(--border-light)', paddingTop:'10px' }}>
                        <div style={{ fontSize:'0.73rem', color:'var(--muted)', fontWeight:'700', marginBottom:'6px', textTransform:'uppercase' }}>Recent Student Feedback</div>
                        {c.recentFeedback.map((fb,fi)=>(
                          <div key={fi} style={{ background:'rgba(255,255,255,0.03)', borderRadius:'8px', padding:'8px 12px', marginBottom:'6px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                              <span style={{ fontWeight:'600', fontSize:'0.82rem' }}>{fb.studentName}</span>
                              <span style={{ color:'#f4a825', fontSize:'0.8rem' }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5-fb.rating)}</span>
                            </div>
                            {fb.comment && <p style={{ color:'var(--muted)', fontSize:'0.8rem', margin:0 }}>{fb.comment}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {showAdd && (
              <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }} onClick={()=>setShowAdd(false)}>
                <div style={{ background:'#0d1e35', border:'1px solid rgba(159,103,255,0.2)', borderRadius:'16px', padding:'32px', maxWidth:'560px', width:'100%', position:'relative', maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
                  <button style={{ position:'absolute', top:'14px', right:'14px', background:'none', border:'1px solid var(--border)', borderRadius:'6px', color:'var(--muted)', padding:'5px 10px', cursor:'pointer' }} onClick={()=>setShowAdd(false)}>✕</button>
                  <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'20px' }}>Add New Counselor</h3>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                    <div className="form-group">
  <label>Email *</label>
  <input
    value={newC.email || ''}
    onChange={e=>setNewC({...newC,email:e.target.value})}
    placeholder="email"
  />
</div>

<div className="form-group">
  <label>Password *</label>
  <input
    type="password"
    value={newC.password || ''}
    onChange={e=>setNewC({...newC,password:e.target.value})}
    placeholder="password"
  />
</div>
                    <div className="form-group"><label>Full Name *</label><input value={newC.name} onChange={e=>setNewC({...newC,name:e.target.value})} placeholder="Dr. Name" /></div>
                    <div className="form-group"><label>Designation *</label><input value={newC.title} onChange={e=>setNewC({...newC,title:e.target.value})} placeholder="Senior Counselor" /></div>
                    <div className="form-group"><label>Specialization</label>
                      <select value={newC.specialization} onChange={e=>setNewC({...newC,specialization:e.target.value})}>
                        <option>Technology</option><option>Business</option><option>Healthcare</option><option>Creative Arts</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Domain</label>
                      <select value={newC.domain} onChange={e=>setNewC({...newC,domain:e.target.value})}>
                        <option>BTech / Engineering</option><option>Business / Commerce</option><option>Medical / Healthcare</option><option>Arts / Design</option>
                      </select>
                    </div>
                    <div className="form-group"><label>Experience</label><input value={newC.exp} onChange={e=>setNewC({...newC,exp:e.target.value})} placeholder="10 years" /></div>
                    <div className="form-group"><label>Slots (comma separated)</label><input value={newC.slots} onChange={e=>setNewC({...newC,slots:e.target.value})} placeholder="Mon 10AM, Wed 2PM" /></div>
                  </div>
                  <div className="form-group"><label>Bio *</label><textarea rows="3" value={newC.bio} onChange={e=>setNewC({...newC,bio:e.target.value})} placeholder="Brief background..." /></div>
                  <button className="btn-primary" style={{ width:'100%', marginTop:'8px' }} onClick={handleAdd}>Add Counselor</button>
                </div>
              </div>
            )}
          </div>
        )}
        {showEdit && editCounselor && (
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
        ✏️ Edit Counselor
      </h3>

      {/* GRID FORM */}
      <div style={{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'12px'
      }}>

        {/* NAME */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Full Name</label>
          <input
            value={editCounselor.name}
            onChange={e=>setEditCounselor({...editCounselor,name:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* EMAIL */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Email</label>
          <input
            value={editCounselor.email || ''}
            onChange={e=>setEditCounselor({...editCounselor,email:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* TITLE */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Title</label>
          <input
            value={editCounselor.title}
            onChange={e=>setEditCounselor({...editCounselor,title:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* SPECIALIZATION */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Specialization</label>
          <input
            value={editCounselor.specialization}
            onChange={e=>setEditCounselor({...editCounselor,specialization:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* DOMAIN */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Domain</label>
          <input
            value={editCounselor.domain}
            onChange={e=>setEditCounselor({...editCounselor,domain:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* EXPERIENCE */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Experience</label>
          <input
            value={editCounselor.exp}
            onChange={e=>setEditCounselor({...editCounselor,exp:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* SLOTS */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Slots</label>
          <input
            value={editCounselor.slots}
            onChange={e=>setEditCounselor({...editCounselor,slots:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* AVATAR */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Avatar</label>
          <input
            value={editCounselor.avatar}
            onChange={e=>setEditCounselor({...editCounselor,avatar:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* BADGE */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Badge</label>
          <input
            value={editCounselor.badge}
            onChange={e=>setEditCounselor({...editCounselor,badge:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* RESUME */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Resume</label>
          <input
            value={editCounselor.resume}
            onChange={e=>setEditCounselor({...editCounselor,resume:e.target.value})}
            style={inputStyle}
          />
        </div>

        {/* PRICE */}
        <div>
          <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Price</label>
          <input
            value={editCounselor.price}
            onChange={e=>setEditCounselor({...editCounselor,price:e.target.value})}
            style={inputStyle}
          />
        </div>

      </div>

      {/* BIO FULL WIDTH */}
      <div style={{ marginTop:'12px' }}>
        <label style={{fontSize:'0.75rem', color:'var(--muted)'}}>Bio</label>
        <textarea
          value={editCounselor.bio}
          onChange={e=>setEditCounselor({...editCounselor,bio:e.target.value})}
          style={{...inputStyle, height:'80px'}}
        />
      </div>

      {/* SAVE BUTTON */}
      <button
        className="btn-primary"
        style={{ width:'100%', marginTop:'14px' }}
        onClick={async () => {
          const token = localStorage.getItem("token")

          const res = await fetch(
            `http://localhost:8081/api/admin/counselors/${editCounselor.id}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(editCounselor)
            }
          )

          const data = await res.json()
          console.log("UPDATE:", data)

          const updated = await apiGetCounselorsAdmin(token)
          setCounselors(updated)

          setShowEdit(false)
        }}
      >
        💾 Save Changes
      </button>

    </div>
  </div>
)}

        
        {tab==='users' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
              <h3 style={{ fontFamily:'Syne,sans-serif' }}>👩‍🎓 Students ({filteredUsers.length})</h3>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                
                <input value={searchUser} onChange={e=>setSearchUser(e.target.value)} placeholder="🔍 Search..." style={{ background:'rgba(10,22,40,0.8)', border:'1px solid var(--border)', borderRadius:'8px', padding:'8px 14px', color:'var(--white)', fontSize:'0.88rem', outline:'none', minWidth:'200px' }} />
                <button onClick={() => setShowAddUser(true)} className="btn-outline" style={{ padding:'8px 16px', fontSize:'0.85rem' }}>
              + Add User
            </button> 
                <button onClick={exportCSV} className="btn-outline" style={{ padding:'8px 16px', fontSize:'0.85rem' }}>📤 Export CSV {exportMsg}</button>
              </div>
            </div>
            {loadingUsers ? ( <p>Loading users...</p>
          ) : filteredUsers.length===0
              ? <div className="card" style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>No students found.</div>
              : <div style={{ background:'var(--card-bg)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead><tr style={{ borderBottom:'1px solid var(--border)', background:'rgba(10,22,40,0.5)' }}>
                      {['Name','Email','Joined','Sessions','Status','Action'].map(h=><th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:'0.76rem', color:'var(--muted)', fontWeight:'600', textTransform:'uppercase' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>{filteredUsers.map((u,i)=>(
                      <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', opacity:blockList.includes(u.email)?0.5:1 }}>
                        <td style={{ padding:'13px 14px', fontSize:'0.88rem' }}><strong>{u.name}</strong></td>
                        <td style={{ padding:'13px 14px', fontSize:'0.88rem', color:'var(--muted)' }}>{u.email}</td>
                        <td style={{ padding:'13px 14px', fontSize:'0.88rem', color:'var(--muted)' }}>{u.joinedAt}</td>
                        <td style={{ padding:'13px 14px', fontSize:'0.88rem', color:'var(--purple-light)', fontWeight:'700' }}>{allAppointments.filter(a=>a.studentEmail===u.email).length}</td>
                        <td style={{ padding:'13px 14px' }}><span style={{
  padding:'2px 9px',
  borderRadius:'10px',
  fontSize:'0.74rem',
  fontWeight:'600',
  background: u.blocked ? 'rgba(239,68,68,0.1)' : 'rgba(100,255,218,0.1)',
  color: u.blocked ? '#ef4444' : '#64ffda'
}}>
  {u.blocked ? 'blocked' : 'active'}
</span></td>
                        <td style={{ padding:'13px 14px' }}><button
  onClick={async () => {
    const token = localStorage.getItem("token")

    const res = await fetch(`http://localhost:8081/api/admin/users/${u.id}/block`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    console.log("BLOCK RESPONSE:", data)

    // reload users
    const updated = await apiGetAllUsers(token)
    setDbUsers(updated)
  }}
  style={{
    background:'none',
    border:'1px solid var(--border)',
    borderRadius:'6px',
    color:'var(--muted)',
    padding:'4px 10px',
    cursor:'pointer',
    fontSize:'0.75rem'
  }}
>
  {u.blocked ? '🔓 Unblock' : '🔒 Block'}
</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
            }
          </div>
        )}
        {/* ✅ ADD USER MODAL */}
      {showAddUser && (
        <div style={{
    position:'fixed',
    inset:0,
    background:'rgba(0,0,0,0.8)',
    zIndex:2000,
    display:'flex',
    alignItems:'center',
    justifyContent:'center'
  }} onClick={()=>setShowAddUser(false)}>
          <div style={{
      background:'#0d1e35',
      border:'1px solid rgba(159,103,255,0.2)',
      borderRadius:'16px',
      padding:'28px',
      width:'420px'
    }} onClick={e=>e.stopPropagation()}>

             <h3 style={{ fontFamily:'Syne', marginBottom:'16px' }}>
        Add New User
      </h3>
            <input
        placeholder="Full Name"
        value={newUser.name}
        onChange={e=>setNewUser({...newUser,name:e.target.value})}
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={newUser.email}
        onChange={e=>setNewUser({...newUser,email:e.target.value})}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Password"
        value={newUser.password}
        onChange={e=>setNewUser({...newUser,password:e.target.value})}
        style={inputStyle}
      />

            <br /><br />

            <button
        className="btn-primary"
        style={{ width:'100%', marginTop:'10px' }}
        onClick={handleAddUser}
      >Add User</button>
            <button className="btn-primary"
        style={{ width:'100%', marginTop:'10px' }} onClick={() => setShowAddUser(false)}>Cancel</button>

          </div>
        </div>
      )}

        {tab==='sessions' && (
          <div>
            <h3 style={{ fontFamily:'Syne,sans-serif', marginBottom:'20px' }}>📅 All Sessions ({allAppointments.length})</h3>
            {allAppointments.length===0
              ? <div className="card" style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>No sessions yet.</div>
              : allAppointments.map((a,i)=>(
                <div key={i} className="card" style={{ marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', gap:'16px', flexWrap:'wrap' }}>
                    <div style={{ background:'rgba(159,103,255,0.08)', border:'1px solid rgba(159,103,255,0.2)', borderRadius:'8px', padding:'8px 12px', textAlign:'center', minWidth:'55px' }}>
                      <div style={{ color:'var(--purple-light)', fontWeight:'700', fontSize:'0.7rem' }}>ID</div>
                      <div style={{ fontWeight:'700' }}>S{String(i+1).padStart(3,'0')}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:'700', marginBottom:'2px' }}>{a.studentName} → {a.counselorName}</div>
                      <div style={{ color:'var(--muted)', fontSize:'0.84rem', marginBottom:'4px' }}>{a.sessionType} · {a.date} at {a.time}</div>
                      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', fontSize:'0.8rem', color:'var(--muted)' }}>
                        <span>📧 {a.studentEmail}</span>
                        <span>🎓 {a.interestedBranch||'N/A'}</span>
                        <span>📍 {a.studyPreference||'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

  <span style={{
    padding:'2px 9px',
    borderRadius:'10px',
    fontSize:'0.74rem',
    fontWeight:'600',
    background:
      a.status === "accepted"
        ? "rgba(34,197,94,0.1)"
        : a.status === "rejected"
        ? "rgba(239,68,68,0.1)"
        : "rgba(244,168,37,0.1)",
    color:
      a.status === "accepted"
        ? "#22c55e"
        : a.status === "rejected"
        ? "#ef4444"
        : "#f4a825"
  }}>
    {a.status || "pending"}
  </span>

  {a.status !== "accepted" && (
    <button onClick={() => updateStatus(a.id, "accepted")}>✅</button>
  )}

  {a.status !== "rejected" && (
    <button onClick={() => updateStatus(a.id, "rejected")}>❌</button>
  )}

</div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab==='allFeedback' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
              <h3 style={{ fontFamily:'Syne,sans-serif' }}>⭐ Feedback & Ratings</h3>
              <div style={{ background:'rgba(244,168,37,0.1)', border:'1px solid rgba(244,168,37,0.25)', borderRadius:'10px', padding:'10px 20px', textAlign:'center' }}>
                <div style={{ fontSize:'1.6rem', fontWeight:'700', color:'#f4a825', fontFamily:'Syne,sans-serif' }}>{avgRating}</div>
                <div style={{ color:'var(--muted)', fontSize:'0.78rem' }}>Avg ({allFeedback.length} reviews)</div>
              </div>
            </div>
            <div className="card" style={{ marginBottom:'20px' }}>
              <h4 style={{ fontWeight:'700', marginBottom:'14px' }}>Overall Distribution</h4>
              {[5,4,3,2,1].map(star=>{
                const count=allFeedback.filter(f=>f.rating===star).length
                const pct=allFeedback.length?(count/allFeedback.length)*100:0
                return (
                  <div key={star} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ color:'#f4a825', fontSize:'0.85rem', width:'24px' }}>{star}★</span>
                    <div style={{ flex:1, height:'8px', background:'rgba(255,255,255,0.07)', borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background:'#f4a825', borderRadius:'4px' }} />
                    </div>
                    <span style={{ color:'var(--muted)', fontSize:'0.78rem', width:'24px' }}>{count}</span>
                  </div>
                )
              })}
            </div>
            {allFeedback.length===0
              ? <div className="card" style={{ textAlign:'center', padding:'40px', color:'var(--muted)' }}>No feedback yet.</div>
              : allFeedback.map((f,i)=>(
                <div key={i} className="card" style={{ marginBottom:'12px' }}>
<div
  style={{
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap'
  }}
>                    <div>
                      <div style={{ fontWeight:'700', marginBottom:'2px' }}>{f.studentName}</div>
                      <div style={{ color:'var(--muted)', fontSize:'0.83rem' }}>Session with {f.counselorName} · {f.date}</div>
                    </div>
                    <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '6px'
    }}
  >
    {/* DELETE BUTTON */}
    <button
      onClick={() => deleteFeedback(f.id)}
      style={{
        background: 'none',
        border: '1px solid var(--border)',
        borderRadius: '6px',
        color: '#ef4444',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '0.75rem'
      }}
    >
      🗑 Delete
    </button>

    {/* RATING */}
    <div>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          style={{
            color: s <= f.rating ? '#f4a825' : 'rgba(255,255,255,0.15)',
            fontSize: '1.1rem'
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{
          color: '#f4a825',
          fontWeight: '700',
          fontSize: '0.85rem',
          marginLeft: '4px'
        }}
      >
        {f.rating}/5
      </span>
    </div>
  </div>
</div>
                  {f.comment && <p style={{ color:'var(--muted)', fontSize:'0.87rem', marginTop:'10px', lineHeight:'1.6', borderTop:'1px solid var(--border)', paddingTop:'10px' }}>{f.comment}</p>}
                </div>
                
                
              ))
              
            }
          </div>
        )}
      </div>
    </div>
  )
}
