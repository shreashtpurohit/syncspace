
import { apiRequest } from '../lib/api'
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types/auth'

export const register = (
  credentials: RegisterCredentials,
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export const login = (
  credentials: LoginCredentials,
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export const getCurrentUser = (): Promise<CurrentUserResponse> => {
  return apiRequest<CurrentUserResponse>('/auth/me')
}

export const logout = (): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  })
}
