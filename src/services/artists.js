import { API_URL, authHeaders, handleResponse } from './utils.js'

export const getArtists = async (page = 0, size = 20, search = '') => {
  const params = new URLSearchParams({ page, size })
  if (search) params.set('search', search)
  const res = await fetch(`${API_URL}/artists?${params}`, { headers: authHeaders() })
  const data = await handleResponse(res, 'Error al obtener los artistas')
  if (Array.isArray(data)) {
    return { artists: data, totalElements: data.length, totalPages: Math.ceil(data.length / size) || 1, currentPage: page, pageSize: size }
  }
  return { artists: data.content || [], totalElements: data.totalElements || 0, totalPages: data.totalPages || 0, currentPage: data.currentPage != null ? data.currentPage : page, pageSize: data.pageSize || size }
}

export const downloadArtist = async (id) => {
  await downloadBlob(`${API_URL}/artists/${id}/download`, 'artist.zip')
}

export const getArtist = async (id) => {
  const res = await fetch(`${API_URL}/artists/${id}`, { headers: authHeaders() })
  return handleResponse(res, 'Error al obtener el artista')
}

export const createArtist = async (name, image) => {
  const formData = new FormData()
  formData.append('name', name)
  if (image) formData.append('image', image)
  const res = await fetch(`${API_URL}/artists`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al crear el artista')
}

export const updateArtist = async (id, name, image) => {
  const formData = new FormData()
  if (name != null) formData.append('name', name)
  if (image) formData.append('image', image)
  const res = await fetch(`${API_URL}/artists/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al actualizar el artista')
}

export const deleteArtist = async (id) => {
  const res = await fetch(`${API_URL}/artists/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar el artista')
}

export const getArtistTracks = async (id, page = 0, size = 20) => {
  const res = await fetch(`${API_URL}/artists/${id}/tracks?page=${page}&size=${size}`, { headers: authHeaders() })
  const data = await handleResponse(res, 'Error al obtener canciones del artista')
  return { tracks: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage }
}

export const getArtistAlbums = async (id, page = 0, size = 20) => {
  const res = await fetch(`${API_URL}/artists/${id}/albums?page=${page}&size=${size}`, { headers: authHeaders() })
  const data = await handleResponse(res, 'Error al obtener álbumes del artista')
  return { albums: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage }
}
