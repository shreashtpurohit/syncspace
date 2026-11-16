
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

import {
  login as loginRequest,
  register as registerRequest,
  getCurrentUser,
  logout as logoutRequest,
} from '../services/authService'

import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth'

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser()

        if (isMounted) {
          setUser(response.user)
        }
      } catch {
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false)
        }
      }
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginRequest(credentials)
    setUser(response.user)
  }

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<void> => {
    const response = await registerRequest(credentials)
    setUser(response.user)
  }

  const logout = async (): Promise<void> => {
    try {
      await logoutRequest()
    } finally {
      setUser(null)
    }
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user),
    isInitializing,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
