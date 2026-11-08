export interface User {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  message: string
  user: User
  accessToken: string
}

export interface CurrentUserResponse {
  user: User
}

export interface RegisterCredentials {
  name: string
  email: string
  password: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiErrorResponse {
  message: string
  errors?: Record<string, string[]>
}