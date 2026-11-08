import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from 'react'

import {
  login as loginRequest,
  register as registerRequest,
} from '../services/authService'

import type {
  LoginCredentials,
  RegisterCredentials,
  User,
} from '../types/auth'

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response = await loginRequest(credentials)

    setUser(response.user)
    setAccessToken(response.accessToken)
  }

  const register = async (
    credentials: RegisterCredentials,
  ): Promise<void> => {
    const response = await registerRequest(credentials)

    setUser(response.user)
    setAccessToken(response.accessToken)
  }

  const logout = (): void => {
    setUser(null)
    setAccessToken(null)
  }

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
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