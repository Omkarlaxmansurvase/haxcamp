import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RequireAdmin({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return null
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return children
}
