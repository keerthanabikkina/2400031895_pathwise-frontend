import { Link } from 'react-router-dom'

const stats = [
  { value: '500+', label: 'Career Paths Mapped' },
  { value: '50+', label: 'Expert Counselors' },
  { value: '10,000+', label: 'Students Guided' },
  { value: '98%', label: 'Satisfaction Rate' },
]

const features = [
  { icon: '🗺️', title: 'Explore 500+ Careers', desc: 'Discover careers by domain, salary, growth, and B.Tech path — with detailed roadmaps.', link: '/careers' },
  { icon: '👨‍💼', title: 'Expert Counselors', desc: 'Free 1-on-1 sessions with industry veterans. View profiles, ratings, and resumes.', link: '/counselors' },
  { icon: '📅', title: 'Book Free Sessions', desc: 'Schedule career counseling with a 3-step booking system. 100% free.', link: '/schedule' },
  { icon: '📝', title: 'Career Assessments', desc: 'Auto-graded quizzes for each career path to test your readiness.', link: '/careers' },
  { icon: '🎓', title: 'B.Tech Pathways', desc: 'Specialized guidance for CSE, ECE, Mech, Civil, and all engineering branches.', link: '/careers' },
  { icon: '📊', title: 'Personal Dashboard', desc: 'Track sessions, view career matches, and access curated learning resources.', link: '/dashboard' },
]

const testimonials = [
  { name: 'Ananya R.', branch: 'CSE Final Year', text: 'pathwise helped me land my dream role at TCS Digital. The roadmap and mock sessions were spot on!', rating: 5 },
  { name: 'Karthik M.', branch: 'ECE 3rd Year', text: 'Dr. Meera\'s session completely changed my perspective on career planning. I now have a clear goal!', rating: 5 },
  { name: 'Divya S.', branch: 'MBA Aspirant', text: 'Prof. Suresh gave me a full MBA roadmap for free. Incredibly helpful, kind, and very professional!', rating: 5 },
]

const successStories = [
  {
    name: 'Ravi Teja',
    role: 'Software Engineer at Google',
    college: 'JNTU Hyderabad, CSE 2023',
    story: 'I had no idea which domain to pick after graduation. pathwise\'s counselor sessions helped me focus on Data Structures and system design. Within 8 months, I cracked Google\'s interview!',
    emoji: '🚀',
    color: '#4f46e5',
  },
  {
    name: 'Shalini Reddy',
    role: 'Data Scientist at Infosys AI Labs',
    college: 'VIT Vellore, IT 2022',
    story: 'I was confused between AI, ML, and analytics. The career assessment pointed me to Data Science. My counselor gave me a month-by-month plan. Now I work at Infosys AI Labs!',
    emoji: '📊',
    color: '#0891b2',
  },
  {
    name: 'Arjun Nair',
    role: 'Associate Product Manager at Swiggy',
    college: 'NIT Warangal, ECE 2023',
    story: 'As an ECE student I thought PM roles were only for MBA grads. My pathwise counselor showed me the exact transition path. Got placed as APM at Swiggy last year!',
    emoji: '🎯',
    color: '#059669',
  },
  {
    name: 'Preethi Sharma',
    role: 'Cloud Architect at Wipro',
    college: 'SRM Chennai, CSE 2021',
    story: 'I booked a free session just out of curiosity. The counselor identified my strength in networking and guided me toward cloud certifications. Today I lead a cloud team of 12 people!',
    emoji: '☁️',
    color: '#7c3aed',
  },
]

export default function Home() {
  return (
    <div style={{ paddingTop: '64px', position: 'relative', overflowX: 'hidden', background: '#f0f4f8' }}>

      {/* ── HERO ── */}
      <section style={s.hero}>
        <img
          src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&q=80"
          alt="students collaborating"
          style={s.bgImage}
        />
        <div style={s.overlay} />
        <div style={s.glassCard}>
          <div style={s.badge}>
            <span style={s.badgeDot} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.82rem' }}>
              100% Free Career Counseling Platform
            </span>
          </div>
          <h1 style={s.heroTitle}>
            Shape Your Future<br />
            <span style={s.heroAccent}>with Expert Guidance</span>
          </h1>
          <p style={s.heroSub}>
            Discover the right career path, connect with expert counselors, and get personalized guidance — all for free. Trusted by 10,000+ students across India.
          </p>
          <div style={s.heroCta}>
            <Link to="/signup" style={{ fontSize: '1rem', padding: '15px 34px', background: '#fff', color: '#4f46e5', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              Get Started Free →
            </Link>
            <Link to="/careers" style={{ fontSize: '1rem', padding: '14px 30px', border: '2px solid rgba(255,255,255,0.7)', color: '#fff', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Explore Careers
            </Link>
          </div>
          <div style={s.heroTrust}>
            <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>Trusted by students from</span>
            {['IIT', 'NIT', 'JNTU', 'VIT', 'SRM'].map(inst => (
              <span key={inst} style={s.instBadge}>{inst}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={s.statsSection}>
        <div className="container">
          <div style={s.statsGrid}>
            {stats.map((stat, i) => (
              <div key={i} style={s.statCard}>
                <div style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg,#6d28d9,#0891b2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={s.section}>
        <div className="container">
          <p style={s.eyebrow}>EVERYTHING YOU NEED</p>
          <h2 className="section-title">Why Students Choose pathwise</h2>
          <p className="section-subtitle">A complete platform built for students — from career discovery to counselor booking, all in one place.</p>
          <div className="grid-3">
            {features.map((f, i) => (
              <Link to={f.link} key={i} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: '16px' }}>{f.icon}</div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>{f.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.65' }}>{f.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ ...s.section, background: '#e8edf5' }}>
        <div className="container">
          <p style={s.eyebrow}>SIMPLE PROCESS</p>
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get career clarity in 3 simple steps — no fees, no commitment.</p>
          <div style={s.steps}>
            {[
              { num: '01', title: 'Create Your Account', desc: 'Sign up for free. No credit card needed. Set up your profile in under 2 minutes.' },
              { num: '02', title: 'Explore & Assess', desc: 'Browse 500+ career paths, take quizzes, and find your best-fit options.' },
              { num: '03', title: 'Book a Free Session', desc: 'Schedule a 1-on-1 with an expert counselor and get your personalized roadmap.' },
            ].map((step, i) => (
              <div key={i} style={s.stepCard}>
                <div style={s.stepNum}>{step.num}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.65' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={s.section}>
        <div className="container">
          <p style={s.eyebrow}>STUDENT STORIES</p>
          <h2 className="section-title">What Students Say</h2>
          <p className="section-subtitle">Hear from students who found their path with pathwise.</p>
          <div className="grid-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <div style={{ marginBottom: '12px' }}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} style={{ color: '#f59e0b', fontSize: '1rem' }}>★</span>
                  ))}
                </div>
                <p style={{ color: '#475569', lineHeight: '1.7', marginBottom: '16px', fontSize: '0.92rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={s.testAvatar}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#1e293b' }}>{t.name}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{t.branch}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORIES ── */}
      <section style={{ ...s.section, background: '#e8edf5' }}>
        <div className="container">
          <p style={s.eyebrow}>REAL RESULTS</p>
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">Real students, real results. See how pathwise transformed careers.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {successStories.map((story, i) => (
              <div key={i} style={{ ...s.storyCard, borderTop: `4px solid ${story.color}` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ ...s.storyAvatar, background: story.color + '18', fontSize: '1.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0 }}>
                    {story.emoji}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1rem', color: '#1e293b' }}>{story.name}</div>
                    <div style={{ color: story.color, fontSize: '0.82rem', fontWeight: '600', marginTop: '2px' }}>{story.role}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>{story.college}</div>
                  </div>
                </div>
                <p style={{ color: '#475569', fontSize: '0.9rem', lineHeight: '1.75', fontStyle: 'italic' }}>"{story.story}"</p>
                <div style={{ marginTop: '14px' }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ color: '#f59e0b', fontSize: '0.85rem' }}>★</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={s.ctaSection}>
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', marginBottom: '16px', color: '#fff' }}>
            Ready to Find Your Path?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
            Join 10,000+ students who have already discovered their ideal career with pathwise.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{ fontSize: '1rem', padding: '16px 36px', background: '#fff', color: '#4f46e5', borderRadius: '12px', fontWeight: 800, textDecoration: 'none' }}>
              Start for Free →
            </Link>
            <Link to="/counselors" style={{ fontSize: '1rem', padding: '15px 32px', border: '2px solid rgba(255,255,255,0.7)', color: '#fff', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
              Meet Our Counselors
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

const s = {
  hero: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '0 16px',
  },
  bgImage: {
    position: 'absolute', width: '100%', height: '100%',
    objectFit: 'cover', top: 0, left: 0, zIndex: 0,
  },
  overlay: {
    position: 'absolute', width: '100%', height: '100%',
    background: 'linear-gradient(135deg, rgba(79,70,229,0.88), rgba(8,145,178,0.75))',
    zIndex: 1,
  },
  glassCard: {
    position: 'relative', zIndex: 2, maxWidth: '660px',
    padding: '48px 52px', borderRadius: '20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.22)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.28)',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '50px', padding: '7px 18px', marginBottom: '28px',
  },
  badgeDot: {
    width: '8px', height: '8px', borderRadius: '50%',
    background: '#fde68a', display: 'inline-block',
  },
  heroTitle: {
    fontFamily: 'Syne, sans-serif',
    fontSize: 'clamp(1.9rem, 4vw, 2.9rem)',
    fontWeight: '800', lineHeight: '1.15',
    marginBottom: '18px', color: '#fff',
  },
  heroAccent: { color: '#fde68a' },
  heroSub: {
    color: 'rgba(255,255,255,0.88)', fontSize: '1.05rem',
    lineHeight: '1.7', maxWidth: '520px', margin: '0 auto 28px',
  },
  heroCta: {
    display: 'flex', gap: '14px', flexWrap: 'wrap',
    marginBottom: '36px', justifyContent: 'center', alignItems: 'center',
  },
  heroTrust: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' },
  instBadge: {
    background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.28)',
    borderRadius: '6px', padding: '4px 12px', fontSize: '0.78rem', color: '#fff', fontWeight: '600',
  },
  statsSection: { padding: '60px 0', background: '#f0f4f8' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '22px' },
  statCard: {
    padding: '28px', borderRadius: '16px', background: '#fff',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', textAlign: 'center',
  },
  section: { padding: '96px 0', background: '#f0f4f8' },
  eyebrow: {
    fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.18em',
    color: '#6d28d9', textTransform: 'uppercase', marginBottom: '12px',
  },
  steps: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '28px' },
  stepCard: {
    padding: '32px', borderRadius: '16px', background: '#fff',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)', transition: 'all 0.3s ease',
  },
  stepNum: { fontSize: '2.6rem', fontWeight: '800', color: '#6d28d9', marginBottom: '12px' },
  testAvatar: {
    width: '42px', height: '42px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6d28d9, #4f46e5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontWeight: '700', fontSize: '0.9rem', flexShrink: 0,
  },
  ctaSection: {
    padding: '100px 0',
    background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
  },
  storyCard: {
    background: '#fff', borderRadius: '16px', padding: '28px',
    border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    transition: 'all 0.3s ease',
  },
  storyAvatar: { flexShrink: 0 },
}