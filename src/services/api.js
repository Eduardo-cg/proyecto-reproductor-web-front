const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getToken = () => localStorage.getItem('token')

const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`
})

const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  ...authHeaders()
})

const handleResponse = async (res, errorMessage = 'Error en la petición') => {
  if (!res.ok) {
    let msg = errorMessage
    try {
      const body = await res.json()
      if (body?.message) msg = body.message
    } catch {
      msg = res.statusText || errorMessage
    }
    throw new Error(msg)
  }
  const contentType = res.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return res.json()
  }
  return res.blob()
}

export const api = {
  async login(username, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    return handleResponse(res, 'Credenciales incorrectas')
  },

  async register(username, email, password) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    })
    return handleResponse(res, 'Error al registrar')
  },

  async getMe() {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders()
    })
    if (!res.ok) return null
    return res.json()
  },

  async getTracks(page = 0, size = 20) {
    const res = await fetch(`${API_URL}/tracks?page=${page}&size=${size}`, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener las canciones')
  },

  async getTrack(id) {
    const res = await fetch(`${API_URL}/tracks/${id}`, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener la canción')
  },

  async getTrackCount() {
    const res = await fetch(`${API_URL}/tracks/count`, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener el conteo')
  },

  async uploadTrack(title, artist, duration, file, album, cover, position) {
    const formData = new FormData()
    formData.append('title', title)
    formData.append('artist', artist)
    formData.append('duration', duration)
    formData.append('file', file)
    formData.append('album', album)
    if (position != null) {
      formData.append('position', position)
    }
    if (cover) {
      formData.append('cover', cover)
    }

    const res = await fetch(`${API_URL}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    })
    return handleResponse(res, 'Error al subir la canción')
  },

  async deleteTrack(id) {
    const res = await fetch(`${API_URL}/tracks/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Error al eliminar la canción')
  },

  async getTrackStreamBlob(id) {
    const res = await fetch(`${API_URL}/tracks/${id}/stream`, {
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Error al cargar el audio')
    return res.blob()
  }
}
