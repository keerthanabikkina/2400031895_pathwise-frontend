import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {

  const [notifications, setNotifications] = useState([])
  const [unread, setUnread] = useState(0)

  // ✅ LOAD FROM BACKEND
  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await fetch("http://localhost:8081/api/notifications", {
        headers: { Authorization: `Bearer ${token}` }
      })

     if (!res.ok) return

     const data = await res.json()

      setNotifications(data)
      setUnread(data.filter(n => !n.read).length)

    } catch (err) {
      console.error("❌ Notification load failed", err)
    }
  }

  useEffect(() => {
    loadNotifications()
  }, [])

  useEffect(() => {
  const interval = setInterval(loadNotifications, 10000)
  return () => clearInterval(interval)
}, [])


  // ✅ MARK ALL READ (API)
  const markAllRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")

      await fetch("http://localhost:8081/api/notifications/read", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      })

      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnread(0)

    } catch (err) {
      console.error("❌ Mark read failed", err)
    }
  }, [])

  // ✅ CLEAR ALL (API)
  const clearAll = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")

      await fetch("http://localhost:8081/api/notifications", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      setNotifications([])
      setUnread(0)

    } catch (err) {
      console.error("❌ Clear failed", err)
    }
  }, [])

  // ❗ TEMP (for UI popup only — until websocket)
  const addNotification = (message, type = "info") => {

    const toast = document.createElement('div')

    const colors = {
      success: '#22c55e',
      error: '#ef4444',
      info: '#1d4ed8',
      warning: '#f59e0b'
    }

    toast.style.cssText = `
      position:fixed;
      top:80px;
      right:20px;
      z-index:9999;
      background:${colors[type] || colors.info};
      color:#fff;
      padding:14px 20px;
      border-radius:12px;
      font-size:0.88rem;
      font-weight:600;
      box-shadow:0 8px 24px rgba(0,0,0,0.3)
    `

    toast.textContent =
      `${type === 'success' ? '✅' :
        type === 'error' ? '❌' :
        type === 'warning' ? '⚠️' : '🔔'} ${message}`

    document.body.appendChild(toast)

    setTimeout(() => {
      toast.style.opacity = '0'
      setTimeout(() => toast.remove(), 300)
    }, 3500)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unread,
      markAllRead,
      clearAll,
      reload: loadNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)