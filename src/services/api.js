const API_URL = 'http://localhost:8080/api/v1'

const getToken = () => localStorage.getItem('token')

const headers = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
})

export const api = {
  // Tracks
  async getTracks() {
    const res = await fetch(`${API_URL}/tracks`, { headers: headers() })
    return res.json()
  },

  async getTrack(id) {
    const res = await fetch(`${API_URL}/tracks/${id}`, { headers: headers() })
    return res.json()
  },

  async createTrack(data) {
    const res = await fetch(`${API_URL}/tracks`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  async deleteTrack(id) {
    await fetch(`${API_URL}/tracks/${id}`, {
      method: 'DELETE',
      headers: headers()
    })
  },

  // Playlists
  async getPlaylists() {
    const res = await fetch(`${API_URL}/playlists`, { headers: headers() })
    return res.json()
  },

  async getPlaylist(id) {
    const res = await fetch(`${API_URL}/playlists/${id}`, { headers: headers() })
    return res.json()
  },

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return res.json()
  },

  async register(name, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })
    return res.json()
  }
}