import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const btechPaths = [
  'Computer Science Engineering', 'Information Technology', 'Electronics & Communication',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Chemical Engineering', 'Aerospace Engineering', 'Biotechnology Engineering',
  'Data Science & AI', 'Cybersecurity', 'Robotics & Automation',
]

const allCareers = [
  // ── B.Tech / Technology ──────────────────────────────────────────
  { id: 1, title: 'Software Engineer', domain: 'Technology', btechPath: 'Computer Science Engineering', icon: '💻', salary: '₹8L – ₹40L', growth: 'Very High', prepTime: '4 years', skills: ['DSA', 'Programming', 'System Design', 'OOP'], desc: 'Build software applications, systems, and services that power the digital world.', popular: true, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'Cracking the Coding Interview – Cheatsheet', url: '#' },
      { type: 'PDF', title: 'System Design Primer (Condensed)', url: '#' },
    ],
    books: [
      { title: 'Cracking the Coding Interview', author: 'Gayle McDowell' },
      { title: 'Clean Code', author: 'Robert C. Martin' },
    ],
    assessment: [
      { q: 'What does O(n log n) represent?', options: ['Quadratic time', 'Linearithmic time', 'Constant time', 'Exponential time'], ans: 1 },
      { q: 'Which data structure uses LIFO?', options: ['Queue', 'Stack', 'Heap', 'Tree'], ans: 1 },
      { q: 'What is REST in API design?', options: ['A database', 'An architectural style', 'A programming language', 'A security protocol'], ans: 1 },
    ]
  },
  { id: 2, title: 'Data Scientist', domain: 'Technology', btechPath: 'Data Science & AI', icon: '📊', salary: '₹10L – ₹45L', growth: 'Very High', prepTime: '4 years', skills: ['Python', 'ML', 'Statistics', 'SQL'], desc: 'Extract insights from large datasets to drive business decisions using AI/ML.', popular: true, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'Statistics for Data Science – Quick Guide', url: '#' },
      { type: 'PDF', title: 'Python ML Algorithms Cheatsheet', url: '#' },
    ],
    books: [
      { title: 'Hands-On Machine Learning', author: 'Aurélien Géron' },
      { title: 'Python for Data Analysis', author: 'Wes McKinney' },
    ],
    assessment: [
      { q: 'What is overfitting in ML?', options: ['Model too simple', 'Model memorises training data', 'Missing data issue', 'Slow training'], ans: 1 },
      { q: 'Which metric is used for regression?', options: ['Accuracy', 'F1 Score', 'RMSE', 'AUC-ROC'], ans: 2 },
      { q: 'What does PCA stand for?', options: ['Principal Component Analysis', 'Probabilistic Clustering Algorithm', 'Parametric Class Assignment', 'Polynomial Cross Aggregation'], ans: 0 },
    ]
  },
  { id: 3, title: 'Cybersecurity Analyst', domain: 'Technology', btechPath: 'Cybersecurity', icon: '🛡️', salary: '₹8L – ₹42L', growth: 'Very High', prepTime: '4 years', skills: ['Network Security', 'Ethical Hacking', 'SIEM', 'Threat Analysis'], desc: 'Protect organisations from cyber threats and security breaches.', popular: true, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'OWASP Top 10 Security Risks Guide', url: '#' },
      { type: 'PDF', title: 'CEH Exam Prep Notes', url: '#' },
    ],
    books: [
      { title: 'The Web Application Hacker\'s Handbook', author: 'Stuttard & Pinto' },
      { title: 'Hacking: The Art of Exploitation', author: 'Jon Erickson' },
    ],
    assessment: [
      { q: 'What is SQL injection?', options: ['A virus', 'Inserting malicious SQL into queries', 'A firewall type', 'A hashing algorithm'], ans: 1 },
      { q: 'What does HTTPS provide?', options: ['Faster speed', 'Encrypted communication', 'Database access', 'Email delivery'], ans: 1 },
      { q: 'What is a zero-day vulnerability?', options: ['Known and patched bug', 'Unknown exploit with no fix yet', 'Old deprecated code', 'Test environment bug'], ans: 1 },
    ]
  },
  { id: 4, title: 'AI / ML Engineer', domain: 'Technology', btechPath: 'Data Science & AI', icon: '🤖', salary: '₹12L – ₹60L', growth: 'Very High', prepTime: '4-5 years', skills: ['Deep Learning', 'PyTorch', 'NLP', 'MLOps'], desc: 'Design and deploy machine learning models and intelligent systems at scale.', popular: true, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'Deep Learning Fundamentals – Notes', url: '#' },
      { type: 'PDF', title: 'Transformer Architecture Explained', url: '#' },
    ],
    books: [
      { title: 'Deep Learning', author: 'Goodfellow, Bengio & Courville' },
      { title: 'Designing Machine Learning Systems', author: 'Chip Huyen' },
    ],
    assessment: [
      { q: 'What activation function is used in output for binary classification?', options: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'], ans: 1 },
      { q: 'What is backpropagation?', options: ['Forward pass algorithm', 'Algorithm to compute gradients', 'Data preprocessing', 'A type of layer'], ans: 1 },
      { q: 'What is a transformer in NLP?', options: ['A hardware component', 'An attention-based neural network', 'A data cleaner', 'A decision tree type'], ans: 1 },
    ]
  },
  { id: 5, title: 'Embedded Systems Engineer', domain: 'Technology', btechPath: 'Electronics & Communication', icon: '🔌', salary: '₹5L – ₹25L', growth: 'High', prepTime: '4 years', skills: ['C/C++', 'RTOS', 'Microcontrollers', 'IoT'], desc: 'Design software for hardware devices from IoT sensors to automotive ECUs.', popular: false, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'ARM Cortex-M Programming Guide', url: '#' },
      { type: 'PDF', title: 'RTOS Concepts Cheatsheet', url: '#' },
    ],
    books: [
      { title: 'Making Embedded Systems', author: 'Elecia White' },
      { title: 'Programming Embedded Systems', author: 'Michael Barr' },
    ],
    assessment: [
      { q: 'What is an RTOS?', options: ['Real-Time Operating System', 'Remote Terminal OS', 'Random Task Organiser', 'Recursive Thread OS'], ans: 0 },
      { q: 'Which protocol is common in IoT?', options: ['FTP', 'MQTT', 'SMTP', 'RDP'], ans: 1 },
      { q: 'What is DMA in embedded systems?', options: ['Direct Memory Access', 'Dynamic Module Adapter', 'Data Management API', 'Device Mounting Authority'], ans: 0 },
    ]
  },
  { id: 6, title: 'Robotics Engineer', domain: 'Technology', btechPath: 'Robotics & Automation', icon: '🦾', salary: '₹7L – ₹35L', growth: 'High', prepTime: '4-5 years', skills: ['ROS', 'Computer Vision', 'Control Systems', 'Python/C++'], desc: 'Design, build, and program robotic systems for manufacturing, healthcare, and research.', popular: false, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'ROS2 Getting Started Guide', url: '#' },
      { type: 'PDF', title: 'PID Control Systems Notes', url: '#' },
    ],
    books: [
      { title: 'Introduction to Robotics: Mechanics & Control', author: 'Craig' },
      { title: 'Probabilistic Robotics', author: 'Thrun, Burgard & Fox' },
    ],
    assessment: [
      { q: 'What does ROS stand for?', options: ['Robot Operating System', 'Robotic Object Simulator', 'Remote Operation Suite', 'Rapid Onboarding System'], ans: 0 },
      { q: 'What is forward kinematics?', options: ['Finding joint angles from position', 'Finding position from joint angles', 'Path planning algorithm', 'A type of motor'], ans: 1 },
      { q: 'Which sensor measures distance using sound waves?', options: ['LiDAR', 'Camera', 'Ultrasonic', 'GPS'], ans: 2 },
    ]
  },
  // ── Business ──────────────────────────────────────────────────────
  { id: 7, title: 'Product Manager', domain: 'Business', icon: '🚀', salary: '₹12L – ₹50L', growth: 'Very High', prepTime: '3 years', skills: ['Strategy', 'Communication', 'Analytics', 'Leadership'], desc: 'Lead the vision, strategy and execution of products from concept to launch.', popular: true, badge: 'badge-gold',
    resources: [
      { type: 'PDF', title: 'Product Manager Interview Prep Notes', url: '#' },
      { type: 'PDF', title: 'PRD Writing Template & Guide', url: '#' },
    ],
    books: [
      { title: 'Inspired', author: 'Marty Cagan' },
      { title: 'The Lean Startup', author: 'Eric Ries' },
    ],
    assessment: [
      { q: 'What is a PRD?', options: ['Product Requirements Document', 'Project Revenue Draft', 'Prototype Review Design', 'Program Resource Directory'], ans: 0 },
      { q: 'What framework is used for product prioritisation?', options: ['SWOT', 'RICE', 'PEST', 'Porter\'s Five Forces'], ans: 1 },
      { q: 'What is the North Star Metric?', options: ['Total revenue', 'Single metric that best captures core value', 'Monthly active users only', 'Customer acquisition cost'], ans: 1 },
    ]
  },
  { id: 8, title: 'Financial Analyst', domain: 'Business', icon: '💰', salary: '₹7L – ₹35L', growth: 'High', prepTime: '4 years', skills: ['Excel', 'Financial Modeling', 'Accounting', 'Valuation'], desc: 'Analyse financial data to help businesses make informed investment decisions.', popular: false, badge: 'badge-gold',
    resources: [
      { type: 'PDF', title: 'DCF Valuation Model Template', url: '#' },
      { type: 'PDF', title: 'Financial Ratios Cheatsheet', url: '#' },
    ],
    books: [
      { title: 'Security Analysis', author: 'Graham & Dodd' },
      { title: 'Financial Modelling', author: 'Simon Benninga' },
    ],
    assessment: [
      { q: 'What is DCF?', options: ['Discounted Cash Flow', 'Direct Cost Formula', 'Debt Capacity Factor', 'Derived Capital Forecast'], ans: 0 },
      { q: 'What does P/E ratio measure?', options: ['Profit per employee', 'Price relative to earnings', 'Product efficiency', 'Payroll expenses'], ans: 1 },
      { q: 'What is EBITDA?', options: ['Earnings before interest, taxes, depreciation, amortization', 'Expected budget total for data analysis', 'Equity basis in total discounted assets', 'Executive bonus total deduction allowance'], ans: 0 },
    ]
  },
  { id: 9, title: 'Chartered Accountant', domain: 'Business', icon: '📋', salary: '₹8L – ₹40L', growth: 'High', prepTime: '5 years', skills: ['Accounting', 'Taxation', 'Auditing', 'Finance'], desc: 'Provide financial advice, audit accounts, and ensure legal compliance for businesses.', popular: true, badge: 'badge-gold',
    resources: [
      { type: 'PDF', title: 'CA Foundation Exam Preparation Notes', url: '#' },
      { type: 'PDF', title: 'Indian Tax Law Summary – AY 2025', url: '#' },
    ],
    books: [
      { title: 'ICAI Study Material – CA Intermediate', author: 'ICAI' },
      { title: 'Corporate Taxation', author: 'Girish Ahuja' },
    ],
    assessment: [
      { q: 'What is the double entry principle?', options: ['Each transaction has two sides: debit and credit', 'Two accounts required per transaction', 'Same amount entered twice', 'Two separate books maintained'], ans: 0 },
      { q: 'What is GST?', options: ['General Sales Tax', 'Goods and Services Tax', 'Gross Surcharge on Trade', 'Government Standard Tax'], ans: 1 },
      { q: 'What is an audit?', options: ['Tax filing', 'Independent examination of financial records', 'Loan application', 'Balance sheet creation'], ans: 1 },
    ]
  },
  // ── Healthcare ───────────────────────────────────────────────────
  { id: 10, title: 'Doctor (MBBS)', domain: 'Healthcare', icon: '🩺', salary: '₹8L – ₹60L', growth: 'Steady', prepTime: '5.5 years', skills: ['Medicine', 'Diagnosis', 'Patient Care', 'Research'], desc: 'Diagnose and treat illnesses to improve patients\' health and quality of life.', popular: true, badge: 'badge-purple',
    resources: [
      { type: 'PDF', title: 'NEET UG Syllabus & Preparation Plan', url: '#' },
      { type: 'PDF', title: 'Clinical Medicine Quick Reference', url: '#' },
    ],
    books: [
      { title: 'Gray\'s Anatomy', author: 'Henry Gray' },
      { title: 'Harrison\'s Principles of Internal Medicine', author: 'Kasper et al.' },
    ],
    assessment: [
      { q: 'What does ECG measure?', options: ['Brain activity', 'Heart\'s electrical activity', 'Blood pressure', 'Oxygen levels'], ans: 1 },
      { q: 'What is the normal resting heart rate?', options: ['20-40 BPM', '60-100 BPM', '120-160 BPM', '40-50 BPM'], ans: 1 },
      { q: 'Which organ produces insulin?', options: ['Liver', 'Kidney', 'Pancreas', 'Spleen'], ans: 2 },
    ]
  },
  { id: 11, title: 'Clinical Psychologist', domain: 'Healthcare', icon: '🧠', salary: '₹5L – ₹25L', growth: 'High', prepTime: '6 years', skills: ['Counseling', 'CBT', 'Assessment', 'Empathy'], desc: 'Help individuals overcome mental health challenges through therapy and support.', popular: false, badge: 'badge-purple',
    resources: [
      { type: 'PDF', title: 'CBT Techniques Reference Guide', url: '#' },
      { type: 'PDF', title: 'DSM-5 Diagnosis Summary', url: '#' },
    ],
    books: [
      { title: 'Feeling Good: The New Mood Therapy', author: 'David Burns' },
      { title: 'The Body Keeps the Score', author: 'Bessel van der Kolk' },
    ],
    assessment: [
      { q: 'What is CBT?', options: ['Cognitive Behavioural Therapy', 'Chemical Brain Treatment', 'Clinical Bipolar Testing', 'Community Based Training'], ans: 0 },
      { q: 'What is the DSM-5?', options: ['A drug database', 'A diagnostic manual for mental disorders', 'A therapy technique', 'A patient registry'], ans: 1 },
      { q: 'What is positive reinforcement?', options: ['Punishing bad behaviour', 'Rewarding desired behaviour', 'Ignoring all behaviour', 'Reducing negative thoughts'], ans: 1 },
    ]
  },
  // ── Creative Arts ─────────────────────────────────────────────────
  { id: 12, title: 'UX/UI Designer', domain: 'Creative Arts', icon: '🎨', salary: '₹5L – ₹28L', growth: 'High', prepTime: '3 years', skills: ['Figma', 'User Research', 'Prototyping', 'Wireframing'], desc: 'Design intuitive and beautiful digital products that users love to interact with.', popular: false, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'Design Thinking Process Guide', url: '#' },
      { type: 'PDF', title: 'Figma Shortcuts & UI Patterns', url: '#' },
    ],
    books: [
      { title: 'Don\'t Make Me Think', author: 'Steve Krug' },
      { title: 'The Design of Everyday Things', author: 'Don Norman' },
    ],
    assessment: [
      { q: 'What is a wireframe?', options: ['Final design file', 'Low-fidelity layout sketch', 'Code implementation', 'User interview transcript'], ans: 1 },
      { q: 'What does UX stand for?', options: ['User Experience', 'Universal Exchange', 'UI Extra', 'Unified Experience'], ans: 0 },
      { q: 'What is A/B testing in UX?', options: ['Accessibility testing', 'Comparing two design variants with users', 'Animation benchmarking', 'Backend API test'], ans: 1 },
    ]
  },
  { id: 13, title: 'Graphic Designer', domain: 'Creative Arts', icon: '🖌️', salary: '₹4L – ₹20L', growth: 'Moderate', prepTime: '3 years', skills: ['Photoshop', 'Illustrator', 'Typography', 'Branding'], desc: 'Create visual content to communicate messages and build brand identities.', popular: false, badge: 'badge-teal',
    resources: [
      { type: 'PDF', title: 'Typography Fundamentals Guide', url: '#' },
      { type: 'PDF', title: 'Adobe Creative Suite Shortcuts', url: '#' },
    ],
    books: [
      { title: 'Thinking with Type', author: 'Ellen Lupton' },
      { title: 'The Elements of Typographic Style', author: 'Robert Bringhurst' },
    ],
    assessment: [
      { q: 'What is the colour model used for print?', options: ['RGB', 'CMYK', 'HSL', 'HEX'], ans: 1 },
      { q: 'What is kerning?', options: ['Adjusting line height', 'Spacing between individual characters', 'Choosing fonts', 'Scaling images'], ans: 1 },
      { q: 'What file format preserves vector quality?', options: ['JPEG', 'PNG', 'SVG', 'GIF'], ans: 2 },
    ]
  },
  // ── Engineering ───────────────────────────────────────────────────
  { id: 14, title: 'Civil Engineer', domain: 'Engineering', btechPath: 'Civil Engineering', icon: '🏗️', salary: '₹5L – ₹28L', growth: 'Steady', prepTime: '4 years', skills: ['AutoCAD', 'Structural Design', 'Project Management', 'Surveying'], desc: 'Design and supervise construction of infrastructure like bridges and buildings.', popular: false, badge: 'badge-gold',
    resources: [
      { type: 'PDF', title: 'IS Codes Quick Reference for Civil Engineers', url: '#' },
      { type: 'PDF', title: 'GATE Civil Engineering Syllabus 2025', url: '#' },
    ],
    books: [
      { title: 'Structural Analysis', author: 'R.C. Hibbeler' },
      { title: 'Soil Mechanics', author: 'K.R. Arora' },
    ],
    assessment: [
      { q: 'What is the unit of stress?', options: ['Newton', 'Pascal', 'Joule', 'Watt'], ans: 1 },
      { q: 'What does BM stand for in structural engineering?', options: ['Base Modulus', 'Bending Moment', 'Bearing Material', 'Bridge Module'], ans: 1 },
      { q: 'What is the water-cement ratio\'s effect on concrete strength?', options: ['Higher ratio = more strength', 'Lower ratio = more strength', 'No effect', 'Only affects colour'], ans: 1 },
    ]
  },
  { id: 15, title: 'Aerospace Engineer', domain: 'Engineering', btechPath: 'Aerospace Engineering', icon: '✈️', salary: '₹7L – ₹40L', growth: 'High', prepTime: '4 years', skills: ['Fluid Dynamics', 'CAD', 'Thermodynamics', 'Control Systems'], desc: 'Design aircraft, spacecraft, satellites and propulsion systems.', popular: false, badge: 'badge-gold',
    resources: [
      { type: 'PDF', title: 'Aerodynamics Basics – Notes', url: '#' },
      { type: 'PDF', title: 'ISRO / NASA Career Pathway Guide', url: '#' },
    ],
    books: [
      { title: 'Introduction to Flight', author: 'John D. Anderson' },
      { title: 'Fundamentals of Aerodynamics', author: 'John D. Anderson' },
    ],
    assessment: [
      { q: 'What is Bernoulli\'s principle?', options: ['Pressure increases with velocity', 'Pressure decreases as velocity increases', 'Pressure equals force times area', 'Pressure is constant in all fluids'], ans: 1 },
      { q: 'What does Mach number measure?', options: ['Aircraft weight', 'Ratio of speed to sound speed', 'Engine thrust', 'Wing area'], ans: 1 },
      { q: 'What is lift force created by?', options: ['Gravity', 'Pressure difference between wing surfaces', 'Engine power alone', 'Aircraft weight'], ans: 1 },
    ]
  },
]

const domains = ['All', 'Technology', 'Business', 'Healthcare', 'Creative Arts', 'Engineering']
const growthLevels = ['All Growth', 'Very High', 'High', 'Moderate', 'Steady']

function gradeFromScore(score, total) {
  const pct = (score / total) * 100
  if (pct >= 90) return { grade: 'A+', label: 'Excellent!', color: '#64ffda' }
  if (pct >= 75) return { grade: 'A', label: 'Great job!', color: '#9f67ff' }
  if (pct >= 60) return { grade: 'B', label: 'Good effort!', color: '#f4a825' }
  if (pct >= 40) return { grade: 'C', label: 'Keep practising.', color: '#ff8e8e' }
  return { grade: 'D', label: 'Review the material and retry.', color: '#ff6b6b' }
}

export default function CareerPaths({ auth }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [domain, setDomain] = useState('All')
  const [growth, setGrowth] = useState('All Growth')
  const [selected, setSelected] = useState(null)
  const [assessmentMode, setAssessmentMode] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [grade, setGrade] = useState(null)

  const filtered = allCareers.filter(c => {
  const searchText = search.toLowerCase().trim()

  const matchSearch =
    c.title.toLowerCase().includes(searchText) ||
    c.domain.toLowerCase().includes(searchText) ||
    (c.btechPath && c.btechPath.toLowerCase().includes(searchText)) ||
    c.desc.toLowerCase().includes(searchText) ||
    c.skills.some(s => s.toLowerCase().includes(searchText))

  const matchDomain = domain === 'All' || c.domain === domain
  const matchGrowth = growth === 'All Growth' || c.growth === growth

  return matchSearch && matchDomain && matchGrowth
})
  const growthColor = { 'Very High': '#9f67ff', 'High': '#81c784', 'Moderate': '#f4a825', 'Steady': '#8b8daa' }

  const openDetail = (career) => {
    setSelected(career)
    setAssessmentMode(false)
    setAnswers({})
    setSubmitted(false)
    setGrade(null)
  }

  const handleAnswer = (qIdx, aIdx) => {
    if (!submitted) setAnswers(prev => ({ ...prev, [qIdx]: aIdx }))
  }

  const submitAssessment = () => {
    const qs = selected.assessment
    let correct = 0
    qs.forEach((q, i) => { if (answers[i] === q.ans) correct++ })
    setGrade(gradeFromScore(correct, qs.length))
    setSubmitted(true)
  }

  const handleBookCounselor = () => {
    if (!auth?.role) { navigate('/login', { state: { from: '/schedule' } }) }
    else navigate('/schedule')
    setSelected(null)
  }

  return (
    <div style={{ paddingTop: '88px', minHeight: '100vh', position: 'relative' }}>
      <div className="orb orb-1" />

      <div style={{ background: 'rgba(17,34,64,0.4)', borderBottom: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container">
          <p style={st.eyebrow}>EXPLORE CAREERS</p>
          <h1 className="section-title">Find Your Career Path</h1>
          <p className="section-subtitle">Discover {allCareers.length}+ career paths with salary, growth, prep resources, and auto-graded assessments.</p>

          {/* B.Tech Paths Banner */}
          <div style={st.btechBanner}>
            <span style={{ color: '#9f67ff', fontWeight: 700, fontSize: '0.85rem', marginRight: '10px' }}>🎓 B.Tech Paths:</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {btechPaths.map(p => (
                <span key={p} style={st.btechTag} onClick={() => { setSearch(p); setDomain('Technology') }}>{p}</span>
              ))}
            </div>
          </div>

          <div style={st.filterRow}>
            <input type="text" placeholder="🔍 Search by title, skill, or B.Tech path..." value={search} onChange={e => setSearch(e.target.value)} style={st.search} />
            <select value={domain} onChange={e => setDomain(e.target.value)} style={st.select}>{domains.map(d => <option key={d} value={d}>{d}</option>)}</select>
            <select value={growth} onChange={e => setGrowth(e.target.value)} style={st.select}>{growthLevels.map(g => <option key={g} value={g}>{g}</option>)}</select>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 24px' }}>
        <p style={{ color: 'var(--muted)', marginBottom: '28px', fontSize: '0.9rem' }}>
          Showing <strong style={{ color: 'var(--white)' }}>{filtered.length}</strong> career paths
        </p>
        <div className="grid-3">
          {filtered.map(career => (
            <div key={career.id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => openDetail(career)}>
              {career.popular && <div style={st.popularBadge}>⭐ Popular</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <span style={{ fontSize: '2rem' }}>{career.icon}</span>
                <div>
                  <h3 style={st.cardTitle}>{career.title}</h3>
                  <span style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{career.domain}</span>
                  {career.btechPath && <div style={{ color: '#9f67ff', fontSize: '0.74rem', marginTop: '2px' }}>🎓 {career.btechPath}</div>}
                </div>
              </div>
              <p style={st.cardDesc}>{career.desc}</p>
              <div style={st.cardMeta}>
                <div><span style={st.metaLabel}>Salary</span><br /><strong style={{ color: '#ff8e8e' }}>{career.salary}</strong></div>
                <div><span style={st.metaLabel}>Growth</span><br /><strong style={{ color: growthColor[career.growth] }}>{career.growth}</strong></div>
                <div><span style={st.metaLabel}>Prep Time</span><br /><strong>{career.prepTime}</strong></div>
              </div>
              <div style={st.skillsRow}>
                {career.skills.slice(0, 3).map(s => <span key={s} className="tag">{s}</span>)}
                {career.skills.length > 3 && <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>+{career.skills.length - 3}</span>}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <span style={st.pillTeal}>📄 {career.resources?.length} Resources</span>
                <span style={st.pillPurple}>📝 Assessment</span>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔎</div>
            <p>No careers match your search. Try different filters.</p>
          </div>
        )}
      </div>

      {/* Career Detail Modal */}
      {selected && (
        <div style={st.overlay} onClick={() => setSelected(null)}>
          <div style={st.modal} onClick={e => e.stopPropagation()}>
            <button style={st.closeBtn} onClick={() => setSelected(null)}>✕</button>

            {!assessmentMode ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>{selected.icon}</span>
                  <div>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.7rem', marginBottom: '4px' }}>{selected.title}</h2>
                    <span className={`badge ${selected.badge}`}>{selected.domain}</span>
                    {selected.btechPath && <span style={{ marginLeft: '8px', background: 'rgba(159,103,255,0.12)', color: '#9f67ff', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '600' }}>🎓 {selected.btechPath}</span>}
                  </div>
                </div>
                <p style={{ color: 'var(--muted)', marginBottom: '24px', lineHeight: '1.7' }}>{selected.desc}</p>

                {/* Stats */}
                <div style={st.statGrid}>
                  <div style={st.statBox}><div style={st.statLabel2}>SALARY RANGE</div><div style={{ color: '#ff8e8e', fontWeight: '700', fontSize: '1.1rem' }}>{selected.salary}</div></div>
                  <div style={st.statBox}><div style={st.statLabel2}>GROWTH</div><div style={{ color: growthColor[selected.growth], fontWeight: '700', fontSize: '1.1rem' }}>{selected.growth}</div></div>
                  <div style={st.statBox}><div style={st.statLabel2}>PREP TIME</div><div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{selected.prepTime}</div></div>
                </div>

                {/* Skills */}
                <h4 style={st.secHead}>Key Skills</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                  {selected.skills.map(s => <span key={s} className="tag" style={{ padding: '6px 14px' }}>{s}</span>)}
                </div>

                {/* PDFs */}
                <h4 style={st.secHead}>📄 Study Resources (PDFs)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {selected.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noreferrer" style={st.resourceRow}>
                      <span style={{ background: 'rgba(255,107,107,0.12)', color: '#ff8e8e', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: '700' }}>{r.type}</span>
                      <span style={{ flex: 1, fontSize: '0.9rem' }}>{r.title}</span>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>↗</span>
                    </a>
                  ))}
                </div>

                {/* Books */}
                <h4 style={st.secHead}>📚 Recommended Books</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                  {selected.books.map((b, i) => (
                    <div key={i} style={st.bookCard}>
                      <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>📖</div>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '2px' }}>{b.title}</div>
                      <div style={{ color: 'var(--muted)', fontSize: '0.77rem' }}>by {b.author}</div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }} onClick={() => setAssessmentMode(true)}>
                    📝 Take Assessment
                  </button>
                  <button className="btn-outline" style={{ flex: 1, padding: '12px', fontSize: '0.9rem' }} onClick={handleBookCounselor}>
                    📅 Book Counselor
                  </button>
                </div>
              </>
            ) : (
              /* Assessment Mode */
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                  <button onClick={() => { setAssessmentMode(false); setSubmitted(false); setAnswers({}); setGrade(null) }} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '6px 12px', color: 'var(--muted)', cursor: 'pointer', fontSize: '0.85rem' }}>← Back</button>
                  <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.4rem' }}>Assessment: {selected.title}</h2>
                </div>

                {submitted && grade && (
                  <div style={{ background: 'rgba(10,22,40,0.8)', border: `1px solid ${grade.color}`, borderRadius: '14px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ fontSize: '3rem', fontWeight: '900', color: grade.color, fontFamily: 'Syne, sans-serif' }}>{grade.grade}</div>
                    <div style={{ color: 'var(--white)', fontWeight: '600', marginTop: '4px' }}>{grade.label}</div>
                    <div style={{ color: 'var(--muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                      {Object.values(answers).filter((a, i) => a === selected.assessment[i].ans).length} / {selected.assessment.length} correct
                    </div>
                  </div>
                )}

                {selected.assessment.map((q, qi) => (
                  <div key={qi} style={{ background: 'rgba(10,22,40,0.5)', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                    <p style={{ fontWeight: '600', marginBottom: '12px', fontSize: '0.95rem' }}>Q{qi + 1}. {q.q}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {q.options.map((opt, oi) => {
                        let bg = 'rgba(10,22,40,0.7)'
                        let border = 'var(--border)'
                        let color = 'var(--muted)'
                        if (answers[qi] === oi && !submitted) { bg = 'rgba(159,103,255,0.15)'; border = '#9f67ff'; color = 'var(--white)' }
                        if (submitted) {
                          if (oi === q.ans) { bg = 'rgba(100,255,218,0.1)'; border = '#64ffda'; color = '#64ffda' }
                          else if (answers[qi] === oi) { bg = 'rgba(255,107,107,0.1)'; border = '#ff6b6b'; color = '#ff6b6b' }
                        }
                        return (
                          <button key={oi} onClick={() => handleAnswer(qi, oi)} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color, cursor: submitted ? 'default' : 'pointer', fontSize: '0.87rem', textAlign: 'left', transition: 'all 0.2s' }}>
                            {submitted && oi === q.ans ? '✓ ' : submitted && answers[qi] === oi ? '✗ ' : ''}{opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                {!submitted ? (
                  <button className="btn-primary" style={{ width: '100%', padding: '14px', marginTop: '4px' }}
                    onClick={submitAssessment} disabled={Object.keys(answers).length < selected.assessment.length}>
                    Submit & Get Grade →
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setAnswers({}); setSubmitted(false); setGrade(null) }}>Retry</button>
                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleBookCounselor}>Book Counselor →</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const st = {
  eyebrow: { fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.15em', color: 'var(--purple-light)', textTransform: 'uppercase', marginBottom: '12px' },
  btechBanner: { background: 'rgba(159,103,255,0.06)', border: '1px solid rgba(159,103,255,0.2)', borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '0', flexWrap: 'wrap', marginBottom: '20px', marginTop: '16px' },
  btechTag: { background: 'rgba(159,103,255,0.1)', border: '1px solid rgba(159,103,255,0.25)', color: '#9f67ff', borderRadius: '20px', padding: '4px 12px', fontSize: '0.77rem', fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' },
  filterRow: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' },
  search: { flex: '1', minWidth: '220px', background: 'rgba(10,22,40,0.8)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', outline: 'none' },
  select: { background: 'rgba(10,22,40,0.9)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 16px', color: 'var(--white)', fontFamily: 'var(--font-body)', fontSize: '0.9rem', cursor: 'pointer' },
  cardTitle: { fontSize: '1.05rem', fontWeight: '600', color: 'var(--white)', fontFamily: 'var(--font-body)', marginBottom: '2px' },
  cardDesc: { color: 'var(--muted)', fontSize: '0.87rem', lineHeight: '1.6', marginBottom: '14px' },
  cardMeta: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' },
  metaLabel: { color: 'var(--muted)', fontSize: '0.75rem' },
  skillsRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' },
  popularBadge: { position: 'absolute', top: '12px', right: '12px', fontSize: '0.72rem', color: '#f4a825', background: 'rgba(244,168,37,0.12)', padding: '3px 10px', borderRadius: '10px', fontWeight: '600' },
  pillTeal: { background: 'rgba(100,255,218,0.07)', border: '1px solid rgba(100,255,218,0.15)', color: 'var(--purple-light)', borderRadius: '20px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: '600' },
  pillPurple: { background: 'rgba(159,103,255,0.08)', border: '1px solid rgba(159,103,255,0.2)', color: '#9f67ff', borderRadius: '20px', padding: '2px 9px', fontSize: '0.72rem', fontWeight: '600' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' },
  modal: { background: '#0d1e35', border: '1px solid rgba(100,255,218,0.15)', borderRadius: '18px', padding: '36px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', position: 'relative' },
  closeBtn: { position: 'absolute', top: '16px', right: '16px', background: 'none', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--muted)', padding: '6px 10px', cursor: 'pointer' },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', background: 'rgba(10,22,40,0.6)', borderRadius: '10px', padding: '16px', marginBottom: '20px' },
  statBox: { textAlign: 'center' },
  statLabel2: { color: 'var(--muted)', fontSize: '0.72rem', letterSpacing: '0.08em', marginBottom: '4px' },
  secHead: { fontSize: '0.9rem', fontWeight: '700', color: 'var(--white)', marginBottom: '12px', letterSpacing: '0.04em' },
  resourceRow: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(10,22,40,0.5)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', textDecoration: 'none', color: 'var(--white)', transition: 'border-color 0.2s' },
  bookCard: { background: 'rgba(10,22,40,0.5)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px', minWidth: '140px', maxWidth: '180px' },
}
