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

  // --- ARTISTS ---
  async getArtists(search) {
    const url = search
      ? `${API_URL}/artists?search=${encodeURIComponent(search)}`
      : `${API_URL}/artists`
    const res = await fetch(url, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener los artistas')
  },

  async getArtist(id) {
    const res = await fetch(`${API_URL}/artists/${id}`, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener el artista')
  },

  async createArtist(name, image) {
    const formData = new FormData()
    formData.append('name', name)
    if (image) {
      formData.append('image', image)
    }

    const res = await fetch(`${API_URL}/artists`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    })
    return handleResponse(res, 'Error al crear el artista')
  },

  async updateArtist(id, name, image) {
    const formData = new FormData()
    if (name != null) {
      formData.append('name', name)
    }
    if (image) {
      formData.append('image', image)
    }

    const res = await fetch(`${API_URL}/artists/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    })
    return handleResponse(res, 'Error al actualizar el artista')
  },

  async deleteArtist(id) {
    const res = await fetch(`${API_URL}/artists/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Error al eliminar el artista')
  },

  // --- TRACKS ---
  async getTracks(page = 0, size = 20) {
    const res = await fetch(`${API_URL}/tracks?page=${page}&size=${size}`, {
      headers: authHeaders()
    })
    const data = await handleResponse(res, 'Error al obtener las canciones')
    return {
      tracks: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      pageSize: data.pageSize
    }
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

  async uploadTrack(title, artistIds, duration, file, album, albumId, cover, releaseDate) {
    const formData = new FormData()
    formData.append('title', title)
    if (artistIds && artistIds.length > 0) {
      formData.append('artistIds', JSON.stringify(artistIds))
    }
    formData.append('duration', duration)
    formData.append('file', file)
    if (album) {
      formData.append('album', album)
    }
    if (albumId != null) {
      formData.append('albumId', String(albumId))
    }
    if (cover) {
      formData.append('cover', cover)
    }
    if (releaseDate) {
      formData.append('releaseDate', releaseDate)
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

  getStreamUrl(id) {
    const token = getToken()
    return `${API_URL}/tracks/${id}/stream?token=${token}`
  },

  async getTrackStreamBlob(id) {
    const res = await fetch(`${API_URL}/tracks/${id}/stream`, {
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Error al cargar el audio')
    return res.blob()
  },

  // --- ALBUMS ---
  async getAlbums(page = 0, size = 20) {
    const res = await fetch(`${API_URL}/albums?page=${page}&size=${size}`, {
      headers: authHeaders()
    })
    const data = await handleResponse(res, 'Error al obtener los álbumes')
    return {
      albums: data.content,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
      currentPage: data.currentPage,
      pageSize: data.pageSize
    }
  },

  async getAlbum(id) {
    const res = await fetch(`${API_URL}/albums/${id}`, {
      headers: authHeaders()
    })
    return handleResponse(res, 'Error al obtener el álbum')
  },

  async createAlbum(title, artistIds, cover, releaseDate) {
    const formData = new FormData()
    formData.append('title', title)
    if (artistIds && artistIds.length > 0) {
      formData.append('artistIds', JSON.stringify(artistIds))
    }
    if (cover) {
      formData.append('cover', cover)
    }
    if (releaseDate) {
      formData.append('releaseDate', releaseDate)
    }

    const res = await fetch(`${API_URL}/albums`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    })
    return handleResponse(res, 'Error al crear el álbum')
  },

  async deleteAlbum(id) {
    const res = await fetch(`${API_URL}/albums/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    if (!res.ok) throw new Error('Error al eliminar el álbum')
  },

  async uploadAlbumTrack(albumId, title, artistIds, duration, file, position, releaseDate) {
    const formData = new FormData()
    formData.append('title', title)
    if (artistIds && artistIds.length > 0) {
      formData.append('artistIds', JSON.stringify(artistIds))
    }
    formData.append('duration', duration)
    formData.append('file', file)
    if (position != null) {
      formData.append('position', position)
    }
    if (releaseDate) {
      formData.append('releaseDate', releaseDate)
    }

    const res = await fetch(`${API_URL}/albums/${albumId}/tracks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`
      },
      body: formData
    })
    return handleResponse(res, 'Error al subir canción al álbum')
  }
}
