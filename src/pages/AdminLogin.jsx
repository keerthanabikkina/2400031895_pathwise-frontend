import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function SimpleCaptcha({ onVerify }) {
  const [a] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [b] = useState(() => Math.floor(Math.random() * 9) + 1)
  const [val, setVal] = useState('')
  const [err, setErr] = useState(false)
  const [verified, setVerified] = useState(false)

  const check = () => {
    if (parseInt(val) === a + b) {
      setErr(false)
      setVerified(true)
      onVerify(true)
    } else {
      setErr(true)
      setVerified(false)
      onVerify(false)
    }
  }

  return (
    <div style={{ background: '#fffbeb', border: `1px solid ${verified ? '#bbf7d0' : '#fde68a'}`, borderRadius: '12px', padding: '14px 16px' }}>
      <label style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
        🔒 Security Check: What is {a} + {b}?
      </label>
      {verified ? (
        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.88rem' }}>✅ Verified!</div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number" value={val}
            onChange={e => { setVal(e.target.value); onVerify(false); setVerified(false) }}
            placeholder="Your answer"
            style={{ flex: 1, border: `1px solid ${err ? '#ef4444' : '#fde68a'}`, borderRadius: '8px', padding: '9px 12px', fontSize: '0.92rem', outline: 'none', background: '#fff', color: '#1e293b' }}
          />
          <button type="button" onClick={check} style={{ padding: '9px 18px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            Check
          </button>
        </div>
      )}
      {err && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>❌ Wrong answer, try again.</p>}
    </div>
  )
}

export default function AdminLogin({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [captchaOk, setCaptchaOk] = useState(false)

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaOk) { setError('Please complete the security check first.'); return }
    setLoading(true)
    const res = await fetch('http://localhost:8081/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (data.error) { setError(data.error); return }
    if (data.role !== 'admin') { setError('Not an admin account'); return }
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    onLogin(data.role, data.email, data.name)
    navigate('/admin')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          <span style={s.logoMark}>⬡</span>
          <span>Path<span style={{ color: '#6d28d9' }}>Wise</span></span>
        </Link>

        <div style={s.badge}><span>🛡️</span> Admin Portal</div>
        <h1 style={s.title}>Admin Sign In</h1>
        <p style={s.sub}>Restricted access — authorised personnel only</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Admin Email</label>
            <input type="text" name="email" value={form.email} onChange={handleChange} placeholder="Enter your admin email" style={s.input} autoComplete="email" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Enter password" style={{ ...s.input, paddingRight: '48px' }} autoComplete="current-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={s.eye}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <SimpleCaptcha onVerify={setCaptchaOk} />

          {error && <div style={s.error}>⚠️ {error}</div>}
          <button type="submit" style={{ ...s.btn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Verifying...' : '🛡️ Sign In as Admin'}
          </button>
        </form>

        <p style={s.foot}>Not an admin? <Link to="/login" style={{ color: '#6d28d9', fontWeight: 600 }}>Student Sign In →</Link></p>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '88px', paddingBottom: '60px', background: '#f0f4f8' },
  card: { background: '#fff', border: '1px solid #fde68a', borderRadius: '24px', padding: '48px 44px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(217,119,6,0.12)', position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', marginBottom: '24px', textDecoration: 'none' },
  logoMark: { width: '32px', height: '32px', background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1rem' },
  badge: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '20px', padding: '6px 18px', width: 'fit-content', margin: '0 auto 20px', fontSize: '0.85rem', fontWeight: '600', color: '#d97706' },
  title: { fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: '6px', fontFamily: 'Syne, sans-serif' },
  sub: { color: '#64748b', textAlign: 'center', marginBottom: '28px', fontSize: '0.88rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { color: '#38639f', fontSize: '0.84rem', fontWeight: '600' },
  input: { background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '13px 16px', color: '#1e293b', fontSize: '0.95rem', outline: 'none', width: '100%' },
  eye: { position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', color: '#ef4444', fontSize: '0.87rem' },
  btn: { width: '100%', padding: '14px', fontSize: '1rem', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' },
  foot: { textAlign: 'center', color: '#64748b', fontSize: '0.88rem', marginTop: '24px' },
}