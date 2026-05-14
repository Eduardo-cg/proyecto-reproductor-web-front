import { reactive } from 'vue'

const API_URL = 'http://localhost:8080/api'

export const useAuthStore = () => {
  const state = reactive({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  })

  const init = () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      state.token = token
      state.user = JSON.parse(user)
      state.isAuthenticated = true
    }
  }

  const login = async (email, password) => {
    state.loading = true
    state.error = null
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) throw new Error('Credenciales incorrectas')
      const data = await res.json()
      state.token = data.token
      state.user = data.user
      state.isAuthenticated = true
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return true
    } catch (e) {
      state.error = e.message
      return false
    } finally {
      state.loading = false
    }
  }

  const register = async (name, email, password) => {
    state.loading = true
    state.error = null
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })
      if (!res.ok) throw new Error('Error al registrar')
      return await login(email, password)
    } catch (e) {
      state.error = e.message
      return false
    } finally {
      state.loading = false
    }
  }

  const logout = () => {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  init()

  return { state, login, register, logout }
}