import { API_URL, authHeaders, handleResponse } from './utils.js'

export const getAlbums = async (page = 0, size = 20, search = '', artistIds = [], sortBy = 'title', sortDirection = 'asc') => {
  const params = new URLSearchParams({ page, size, sortBy, sortDirection })
  if (search) params.set('search', search)
  if (artistIds.length > 0) params.set('artistIds', artistIds.join(','))
  const res = await fetch(`${API_URL}/albums?${params}`, { headers: authHeaders() })
  const data = await handleResponse(res, 'Error al obtener los álbumes')
  return { albums: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage, pageSize: data.pageSize }
}

export const getAlbum = async (id) => {
  const res = await fetch(`${API_URL}/albums/${id}`, { headers: authHeaders() })
  return handleResponse(res, 'Error al obtener el álbum')
}

export const createAlbum = async (title, artistIds, cover, releaseDate) => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al crear el álbum')
}

export const updateAlbum = async (id, title, artistIds, releaseDate, cover) => {
  const formData = new FormData()
  if (title != null) formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al actualizar el álbum')
}

export const deleteAlbum = async (id) => {
  const res = await fetch(`${API_URL}/albums/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar el álbum')
}

export const reorderAlbumTracks = async (albumId, trackIds) => {
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks/reorder`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(trackIds)
  })
  if (!res.ok) throw new Error('Error al reordenar las canciones')
}

export const deleteAlbumTrack = async (albumId, trackId) => {
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks/${trackId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error('Error al eliminar la canción del álbum')
}

export const uploadAlbumTrack = async (albumId, title, artistIds, duration, file, position, releaseDate) => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  formData.append('duration', duration)
  formData.append('file', file)
  if (position != null) formData.append('position', position)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al subir canción al álbum')
}
