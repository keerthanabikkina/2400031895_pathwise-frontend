import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import NotificationBell from './NotificationBell'

export default function Navbar({ auth, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isLoggedIn = !!auth?.role

  const navLinks = [
    ...(!isLoggedIn ? [{ path: '/', label: 'Home', icon: '🏠' }] : []),
    ...(auth?.role === 'user' ? [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/schedule', label: 'Schedule', icon: '📅' },
      { path: '/myschedule', label: 'My Sessions', icon: '📋' },
      { path: '/chat', label: 'Chat', icon: '💬' },
    ] : []),
    ...(auth?.role === 'admin' ? [
      { path: '/admin', label: 'Admin Panel', icon: '🛡️' },
    ] : []),
    ...(auth?.role === 'counselor' ? [
      { path: '/counselor', label: 'Dashboard', icon: '📊' },
      { path: '/myschedule', label: 'My Sessions', icon: '📋' },
      { path: '/chat', label: 'Chat', icon: '💬' },
    ] : []),
    { path: '/careers', label: 'Career Paths', icon: '🗺️' },
    { path: '/counselors', label: 'Mentors', icon: '👨‍💼' },
  ]

  const handleLogout = () => { onLogout(); navigate('/'); setSidebarOpen(false) }
  const isActive = (path) => location.pathname === path

  return (
    <>
      {isLoggedIn && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {isLoggedIn && (
        <aside style={{ ...styles.sidebar, left: sidebarOpen ? '0' : '-280px' }}>
          <div style={styles.sidebarTop}>
            <Link to="/" style={styles.sidebarLogo} onClick={() => setSidebarOpen(false)}>
              <div style={styles.sidebarLogoMark}>🚀</div>
              <div>
                <div style={styles.sidebarLogoText}>Path<span style={{ color: '#5b21b6' }}>Wise</span></div>
                <div style={styles.sidebarTagline}>Your Career, Your Future</div>
              </div>
            </Link>
            <button onClick={() => setSidebarOpen(false)} style={styles.closeBtn}>✕</button>
          </div>

          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>{auth?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <div>
              <div style={styles.userName}>{auth?.name || 'User'}</div>
              <div style={styles.userRole}>{auth?.role}</div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '10px 12px', overflowY: 'auto' }}>
            <p style={styles.navSection}>MENU</p>
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '11px 14px', borderRadius: '10px', marginBottom: '3px',
                  textDecoration: 'none', fontSize: '0.92rem',
                  fontWeight: isActive(link.path) ? 700 : 500,
                  background: isActive(link.path) ? '#ede9fe' : 'transparent',
                  color: isActive(link.path) ? '#5b21b6' : '#475569',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { if (!isActive(link.path)) e.currentTarget.style.background = '#f5f3ff' }}
                onMouseLeave={e => { if (!isActive(link.path)) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: '1.15rem', width: '24px', textAlign: 'center' }}>{link.icon}</span>
                <span>{link.label}</span>
                {isActive(link.path) && (
                  <span style={{ marginLeft: 'auto', width: '7px', height: '7px', borderRadius: '50%', background: '#5b21b6' }} />
                )}
              </Link>
            ))}
          </nav>

          <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '12px',
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '10px', fontWeight: 700,
                cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              🚪 Logout
            </button>
          </div>
        </aside>
      )}

      {/* TOP NAVBAR */}
      <nav style={styles.nav}>
        <div style={styles.inner}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {isLoggedIn && (
              <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
                ☰
              </button>
            )}

            <Link to="/" style={styles.logo}>
              <div style={styles.logoMark}>🚀</div>
              <div>
                <div style={styles.logoText}>Path<span style={{ color: '#5b21b6' }}>Wise</span></div>
                {!isLoggedIn && <div style={styles.tagline}>Choose Your Career. Shape Your Best Future.</div>}
              </div>
            </Link>
          </div>

          {!isLoggedIn && (
            <div style={styles.guestLinks}>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    ...styles.link,
                    color: isActive(link.path) ? '#5b21b6' : '#475569',
                    fontWeight: isActive(link.path) ? 700 : 500,
                    background: isActive(link.path) ? '#ede9fe' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          <div style={styles.right}>
            {isLoggedIn && <NotificationBell />}
            {isLoggedIn ? (
              <>
                <span style={{ fontSize: '0.85rem', color: '#334155' }}>
                  Hi, {auth?.name?.split(' ')[0]}
                </span>
                <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.loginBtn}>Sign In</Link>
                <Link to="/signup" className="btn-primary">Sign Up</Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </>
  )
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 900,
    background: '#ffffff',   // ✅ clean white
    borderBottom: '1px solid #e5e7eb',
    height: '64px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  inner: {
    maxWidth: '1300px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '100%',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoMark: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #5b21b6, #7c3aed)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { fontWeight: 800, fontSize: '1.2rem', color: '#0f172a' },
  tagline: { fontSize: '0.65rem', color: '#94a3b8' },
  guestLinks: { display: 'flex', gap: '4px' },
  link: { padding: '8px 13px', borderRadius: '8px' },
  right: { display: 'flex', alignItems: 'center', gap: '12px' },
  loginBtn: { color: '#5b21b6', fontWeight: 600 },
  logoutBtn: {
    padding: '7px 16px',
    background: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontWeight: 700,
  },
  menuBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#475569',   // ✅ less flashy
    cursor: 'pointer',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.3)',
  },
  sidebar: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    width: '268px',
    background: '#fff',
    borderRight: '1px solid #e5e7eb',
  },
}