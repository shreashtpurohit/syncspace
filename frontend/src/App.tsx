import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'

function HomeRedirect() {
  const { isAuthenticated } = useAuth()

  return (
    <Navigate
      to={isAuthenticated ? '/dashboard' : '/login'}
      replace
    />
  )
}

function LoginPlaceholder() {
  return <h1>SyncSpace — Login</h1>
}

function RegisterPlaceholder() {
  return <h1>SyncSpace — Register</h1>
}

function DashboardPlaceholder() {
  return <h1>SyncSpace — Dashboard</h1>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<LoginPlaceholder />} />
      <Route path="/register" element={<RegisterPlaceholder />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<DashboardPlaceholder />}
        />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}