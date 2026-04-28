import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiSignup } from '../api'

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
    <div style={{ background: '#f8faff', border: `1px solid ${verified ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '12px', padding: '14px 16px' }}>
      <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
        🔒 Verify you're human: What is {a} + {b}?
      </label>
      {verified ? (
        <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.88rem' }}>✅ Verified!</div>
      ) : (
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="number" value={val}
            onChange={e => { setVal(e.target.value); onVerify(false); setVerified(false) }}
            placeholder="Your answer"
            style={{ flex: 1, border: `1px solid ${err ? '#ef4444' : '#cbd5e1'}`, borderRadius: '8px', padding: '9px 12px', fontSize: '0.92rem', outline: 'none', background: '#fff', color: '#1e293b' }}
          />
          <button type="button" onClick={check} style={{ padding: '9px 18px', background: '#6d28d9', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}>
            Check
          </button>
        </div>
      )}
      {err && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px' }}>❌ Wrong answer, try again.</p>}
    </div>
  )
}

export default function Signup({ onSignup, onLogin, users }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [captchaOk, setCaptchaOk] = useState(false)

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const validate = () => {
    if (!captchaOk) return 'Please complete the CAPTCHA verification.'
    if (!form.name.trim()) return 'Please enter your full name.'
    if (!form.email.trim()) return 'Please enter your email address.'
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (form.password !== form.confirm) return 'Passwords do not match.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    const res = await apiSignup(form.name.trim(), form.email.trim().toLowerCase(), form.password)
    setLoading(false)
    if (!res) { setError('Backend not reachable'); return }
    if (res.error) { setError(res.error); return }
    const userData = { name: res.name, email: res.email, role: res.role }
    localStorage.setItem('token', res.token)
    localStorage.setItem('user', JSON.stringify(userData))
    onLogin(userData.role, userData.email, userData.name)
    navigate('/dashboard')
  }

  const strength = (() => {
    const p = form.password
    if (!p) return null
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '20%' }
    if (p.length < 8) return { label: 'Weak', color: '#f59e0b', width: '40%' }
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: '#22c55e', width: '100%' }
    return { label: 'Moderate', color: '#60a5fa', width: '70%' }
  })()

  return (
    <div style={s.page}>
      <div style={s.card}>
        <Link to="/" style={s.logo}>
          <div style={s.logoMark}>⬡</div>
          <span>Path<span style={{ color: '#6d28d9' }}>Wise</span></span>
        </Link>

        <h1 style={s.title}>Create Your Account</h1>
        <p style={s.sub}>Join 10,000+ students — it's free forever</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" style={s.input} autoComplete="name" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" style={s.input} autoComplete="email" />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" style={{ ...s.input, paddingRight: '48px' }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={s.eye}>{showPass ? '🙈' : '👁️'}</button>
            </div>
            {strength && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: strength.width, height: '100%', background: strength.color, borderRadius: '2px', transition: 'width 0.3s' }} />
                </div>
                <span style={{ fontSize: '0.74rem', color: strength.color, marginTop: '3px', display: 'block' }}>{strength.label}</span>
              </div>
            )}
          </div>

          <div style={s.field}>
            <label style={s.label}>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirm ? 'text' : 'password'} name="confirm" value={form.confirm}
                onChange={handleChange} placeholder="Re-enter your password"
                style={{ ...s.input, paddingRight: '48px', borderColor: form.confirm && form.confirm !== form.password ? '#ef4444' : '' }}
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={s.eye}>{showConfirm ? '🙈' : '👁️'}</button>
            </div>
          </div>

          <SimpleCaptcha onVerify={setCaptchaOk} />

          {error && <div style={s.error}>⚠️ {error}</div>}

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem', borderRadius: '12px', opacity: loading ? 0.7 : 1 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Free Account →'}
          </button>

          <p style={s.terms}>
            By signing up, you agree to our{' '}
            <span style={{ color: '#6d28d9', cursor: 'pointer' }}>Terms of Service</span>
            {' '}and{' '}
            <span style={{ color: '#6d28d9', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>
        </form>

        <div style={s.divider}>
          <span style={{ background: '#fff', padding: '0 14px', color: '#94a3b8', fontSize: '0.82rem' }}>or</span>
        </div>

        <Link to="/login" className="btn-outline" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '12px', fontSize: '0.92rem' }}>
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '88px', paddingBottom: '60px', background: '#f0f4f8' },
  card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: '24px', padding: '48px 44px', width: '100%', maxWidth: '460px', boxShadow: '0 8px 40px rgba(109,40,217,0.1)', position: 'relative', zIndex: 1 },
  logo: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontFamily: 'Syne, sans-serif', fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', marginBottom: '32px', textDecoration: 'none' },
  logoMark: { width: '32px', height: '32px', background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  title: { fontSize: '1.9rem', fontWeight: '800', color: '#1e293b', textAlign: 'center', marginBottom: '8px', fontFamily: 'Syne, sans-serif' },
  sub: { color: '#64748b', textAlign: 'center', marginBottom: '28px', fontSize: '0.92rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '7px' },
  label: { color: '#475569', fontSize: '0.84rem', fontWeight: '600' },
  input: { background: '#f8faff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '13px 16px', color: '#1e293b', fontSize: '0.95rem', outline: 'none', width: '100%' },
  eye: { position: 'absolute', right: '13px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' },
  error: { background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '10px 14px', color: '#ef4444', fontSize: '0.87rem' },
  terms: { color: '#94a3b8', fontSize: '0.78rem', textAlign: 'center', lineHeight: '1.6' },
  divider: { textAlign: 'center', position: 'relative', margin: '20px 0', borderTop: '1px solid #e2e8f0' },
}