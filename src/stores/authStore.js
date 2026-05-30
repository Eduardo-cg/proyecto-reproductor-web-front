import { reactive } from 'vue'
import { api } from '../services/api'

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
    try {
      state.token = token
      state.user = JSON.parse(user)
      state.isAuthenticated = true
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

const login = async (username, password) => {
  state.loading = true
  state.error = null
  try {
    const data = await api.login(username, password)
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

const register = async (username, email, password) => {
  state.loading = true
  state.error = null
  try {
    await api.register(username, email, password)
    return await login(username, password)
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
  state.error = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const getRoleName = () => {
  return state.user?.roleName || 'STANDARD'
}

const isAdmin = () => {
  return getRoleName() === 'ADMIN'
}

init()

export const useAuthStore = () => ({ state, login, register, logout, getRoleName, isAdmin })
