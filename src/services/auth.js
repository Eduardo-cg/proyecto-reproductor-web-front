import { API_URL, handleResponse } from './utils.js'

export const login = async (username, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  return handleResponse(res, 'Credenciales incorrectas')
}

export const register = async (username, email, password) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  })
  return handleResponse(res, 'Error al registrar')
}

export const getMe = async () => {
  const { authHeaders } = await import('./utils.js')
  const res = await fetch(`${API_URL}/auth/me`, { headers: authHeaders() })
  if (!res.ok) return null
  return res.json()
}
