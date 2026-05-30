import { reactive } from 'vue'
import { api } from '../services/api'
import type { UserInfo } from '../types'

interface AuthState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const state = reactive<AuthState>({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null
})

const init = (): void => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    try {
      state.token = token
      state.user = JSON.parse(user) as UserInfo
      state.isAuthenticated = true
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}

const login = async (username: string, password: string): Promise<boolean> => {
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
    state.error = (e as Error).message
    return false
  } finally {
    state.loading = false
  }
}

const register = async (username: string, email: string, password: string): Promise<boolean> => {
  state.loading = true
  state.error = null
  try {
    await api.register(username, email, password)
    return await login(username, password)
  } catch (e) {
    state.error = (e as Error).message
    return false
  } finally {
    state.loading = false
  }
}

const logout = (): void => {
  state.user = null
  state.token = null
  state.isAuthenticated = false
  state.error = null
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

const getRoleName = (): string => {
  return state.user?.roleName || 'STANDARD'
}

const isAdmin = (): boolean => {
  return getRoleName() === 'ADMIN'
}

init()

export const useAuthStore = () => ({ state, login, register, logout, getRoleName, isAdmin })
