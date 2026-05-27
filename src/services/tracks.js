import { API_URL, authHeaders, handleResponse, downloadBlob } from './utils.js'

export const getTracks = async (page = 0, size = 20) => {
  const res = await fetch(`${API_URL}/tracks?page=${page}&size=${size}`, { headers: authHeaders() })
  const data = await handleResponse(res, 'Error al obtener las canciones')
  return { tracks: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage, pageSize: data.pageSize }
}

export const getTrack = async (id) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, { headers: authHeaders() })
  return handleResponse(res, 'Error al obtener la canción')
}

export const getTrackCount = async () => {
  const res = await fetch(`${API_URL}/tracks/count`, { headers: authHeaders() })
  return handleResponse(res, 'Error al obtener el conteo')
}

export const uploadTrack = async (title, artistIds, duration, file, album, albumId, cover, releaseDate) => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  formData.append('duration', duration)
  formData.append('file', file)
  if (album) formData.append('album', album)
  if (albumId != null) formData.append('albumId', String(albumId))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/tracks`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al subir la canción')
}

export const updateTrack = async (id, title, artistIds, album, releaseDate, cover) => {
  const formData = new FormData()
  if (title != null) formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (album != null) formData.append('album', album)
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/tracks/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse(res, 'Error al actualizar la canción')
}

export const deleteTrack = async (id) => {
  const res = await fetch(`${API_URL}/tracks/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar la canción')
}

export const getStreamUrl = (id) => {
  const token = localStorage.getItem('token')
  return `${API_URL}/tracks/${id}/stream?token=${token}`
}

export const getTrackStreamBlob = async (id) => {
  const res = await fetch(`${API_URL}/tracks/${id}/stream`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al cargar el audio')
  return res.blob()
}

export const downloadTrack = async (id) => {
  await downloadBlob(`${API_URL}/tracks/${id}/download`, 'track.mp3')
}

export const downloadAlbumZip = async (id) => {
  await downloadBlob(`${API_URL}/albums/${id}/download`, 'album.zip')
}

export const downloadArtistZip = async (id) => {
  await downloadBlob(`${API_URL}/artists/${id}/download`, 'artist.zip')
}
