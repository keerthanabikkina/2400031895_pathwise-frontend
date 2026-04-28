// ─── pathwise API Client ───────────────────────────────────────
// Connects to Spring Boot backend at localhost:8080
// Falls back to in-memory data if backend is offline

const BASE_URL = 'http://localhost:8081/api'

async function request(method, path, body = null, token = null) {
  try {
    const headers = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    })

    const data = await res.json()

    // ✅ return backend response EVEN if error
    return data

  } catch (err) {
    console.warn(`[API] ${method} ${path} failed`, err.message)
    return null // only real network failure
  }
}

// Auth
export const apiSignup = (name, email, password) =>
  request('POST', '/auth/signup', { name, email, password })

export const apiLogin = (email, password) =>
  request('POST', '/auth/login', { email, password })

// Counselors
export const apiGetCounselors = () => request('GET', '/counselors')
export const apiAddUser = (data, token) =>
  request('POST', '/admin/users', data, token)

// Appointments
export const apiBookAppointment = (data, token) =>
  request('POST', '/appointments', data, token)

export const apiGetMyAppointments = (token) =>
  request('GET', '/appointments/my', null, token)


export const apiGetCounselorsAdmin = (token) =>
  request('GET', '/admin/counselors', null, token)

// Feedback
export const apiSubmitFeedback = (data, token) =>
  request('POST', '/feedback', data, token)

// Admin
export const apiGetAllUsers = (token) => request('GET', '/admin/users', null, token)
export const apiGetAllAppointments = (token) => request('GET', '/admin/appointments', null, token)
export const apiAddCounselor = (data, token) => request('POST', '/admin/counselors', data, token)
