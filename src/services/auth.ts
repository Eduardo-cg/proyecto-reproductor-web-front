import type { LoginResponse, UserInfo } from '../types'
import { API_URL, handleResponse } from './utils'

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  return handleResponse<LoginResponse>(res, 'Credenciales incorrectas')
}

export const register = async (username: string, email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  return handleResponse<LoginResponse>(res, 'Error al registrar')
}

export const getMe = async (): Promise<UserInfo | null> => {
  const { authHeaders } = await import('./utils')
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
  if (!res.ok) return null
  return res.json() as Promise<UserInfo>
}
