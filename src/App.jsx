import { useState,useEffect} from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import MySchedule from "./pages/MySchedule"
import Home from './pages/Home'
import CareerPaths from './pages/CareerPaths'
import Counselors from './pages/Counselors'
import Schedule from './pages/Schedule'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import AdminLogin from './pages/AdminLogin'
import Chat from './pages/Chat'
import { NotificationProvider } from './context/NotificationContext'
import NotificationBell from './components/NotificationBell'
import CounselorDashboard from './pages/CounselorDashboard'



export default function App() {
  const [auth, setAuth] = useState({ role:null, email:null, name:null })
  const [users, setUsers] = useState([])
  const [adminCreds] = useState({ email:'admin@pathwise.com', password:'pathwise@2025' })
  const [counselors, setCounselors] = useState([])
const [loadingCounselors, setLoadingCounselors] = useState(true)
  const [appointments, setAppointments] = useState([])
  const [feedback, setFeedback] = useState([])
  const [authLoading, setAuthLoading] = useState(true)
useEffect(() => {
    const user = localStorage.getItem("user")

    if (user) {
      const parsed = JSON.parse(user)

      setAuth({
        role: parsed.role,
        email: parsed.email,
        name: parsed.name
      })
    }
    setAuthLoading(false) // ✅ important
  }, [])

  useEffect(() => {
  const fetchCounselors = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/counselors")
      const data = await res.json()

      console.log("🔥 COUNSELORS FROM DB:", data)

      setCounselors(data)
    } catch (err) {
      console.error("❌ Error fetching counselors:", err)
    } finally {
      setLoadingCounselors(false)
    }
  }

  fetchCounselors()
}, [])
  const handleLogin = (role, email, name) => {
    setAuth({ role, email, name })

    // store in localStorage
    localStorage.setItem("user", JSON.stringify({ role, email, name }))
  }

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    setAuth({ role:null, email:null, name:null })
  }

  const handleSignup = (name, email, password) => {
    setUsers(prev => [...prev, { name, email, password, joinedAt: new Date().toLocaleDateString() }])
  }
  const addAppointment = (appt) => {
    setAppointments(prev => [...prev, { ...appt, id:`S${String(prev.length+1).padStart(3,'0')}`, status:'pending', bookedAt:new Date().toLocaleDateString() }])
  }
  const addFeedback = (fb) => setFeedback(prev => [...prev, fb])

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Navbar auth={auth} onLogout={handleLogout} NotificationBell={NotificationBell} />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/careers" element={<CareerPaths auth={auth} />} />
<Route 
  path="/counselors" 
  element={
    loadingCounselors 
      ? <div style={{ paddingTop:100, textAlign:'center' }}>Loading...</div>
      : <Counselors counselors={counselors} auth={auth} />
  } 
/>            <Route 
  path="/chat" 
  element={
(auth.role === 'user' || auth.role === 'counselor')      ? <Chat auth={auth} counselors={counselors} />
      : <Navigate to="/login" />
  } 
/>
<Route 
  path="/schedule" 
  element={
    auth.role==='user'
      ? (loadingCounselors
          ? <div style={{ paddingTop:100 }}>Loading...</div>
          : <Schedule auth={auth} counselors={counselors} />
        )
      : <Navigate to="/login" />
  } 
/>            <Route path="/login" element={auth.role ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} users={users} adminCreds={adminCreds} />} />
            <Route path="/signup" element={auth.role ? <Navigate to="/dashboard" /> : <Signup onSignup={handleSignup} onLogin={handleLogin} users={users} />} />
            <Route path="/admin-login" element={auth.role==='admin' ? <Navigate to="/admin" /> : <AdminLogin onLogin={handleLogin} adminCreds={adminCreds} />} />
            <Route path="/dashboard" element={auth.role==='user' ? <UserDashboard auth={auth} appointments={appointments.filter(a=>a.studentEmail===auth.email)} counselors={counselors} onFeedback={addFeedback} feedback={feedback} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={auth.role==='admin' ? <AdminDashboard users={users} appointments={appointments} counselors={counselors} setCounselors={setCounselors} feedback={feedback} adminEmail={auth.email} /> : <Navigate to="/admin-login" />} />
         <Route 
  path="/counselor" 
  element={
    authLoading
      ? <div>Loading...</div>   // ✅ WAIT
      : auth.role === 'counselor'
        ? <CounselorDashboard auth={auth} />
        : <Navigate to="/login" />
  } 
/>
<Route path="/myschedule" element={<MySchedule />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </NotificationProvider>
  )
}
