import type { PageResponse, TrackDTO } from '../types'
import { API_URL, authHeaders, downloadBlob, getToken, handleResponse } from './utils'

interface TracksResult {
  tracks: TrackDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export const getTracks = async (
  page: number = 0,
  size: number = 10,
  search: string = '',
  artistIds: number[] = [],
  albumIds: number[] = [],
  sortBy: string = 'title',
  sortDirection: string = 'asc'
): Promise<TracksResult> => {
  const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDirection })
  if (search) params.set('search', search)
  if (artistIds.length > 0) params.set('artistIds', artistIds.join(','))
  if (albumIds.length > 0) params.set('albumIds', albumIds.join(','))
  const res = await fetch(`${API_URL}/tracks?${params}`, { headers: authHeaders() })
  const data = await handleResponse<PageResponse<TrackDTO>>(res, 'Error al obtener las canciones')
  return { tracks: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage, pageSize: data.pageSize }
}

export const getTrack = async (id: number): Promise<TrackDTO> => {
  const res = await fetch(`${API_URL}/tracks/${id}`, { headers: authHeaders() })
  return handleResponse<TrackDTO>(res, 'Error al obtener la canción')
}

export const getTrackCount = async (): Promise<number> => {
  const res = await fetch(`${API_URL}/tracks/count`, { headers: authHeaders() })
  return handleResponse<number>(res, 'Error al obtener el conteo')
}

export const uploadTrack = async (
  title: string,
  artistIds: number[],
  duration: number,
  file: File,
  album?: string,
  albumId?: number,
  cover?: File,
  releaseDate?: string
): Promise<TrackDTO> => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  formData.append('duration', String(duration))
  formData.append('file', file)
  if (album) formData.append('album', album)
  if (albumId != null) formData.append('albumId', String(albumId))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/tracks`, { method: 'POST', headers: authHeaders(), body: formData })
  return handleResponse<TrackDTO>(res, 'Error al subir la canción')
}

export const updateTrack = async (
  id: number,
  title: string,
  artistIds: number[],
  album?: string,
  releaseDate?: string,
  cover?: File
): Promise<TrackDTO> => {
  const formData = new FormData()
  if (title != null) formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (album != null) formData.append('album', album)
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/tracks/${id}`, { method: 'PUT', headers: authHeaders(), body: formData })
  return handleResponse<TrackDTO>(res, 'Error al actualizar la canción')
}

export const deleteTrack = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/tracks/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar la canción')
}

export const getStreamUrl = (id: number): string => {
  return `${API_URL}/tracks/${id}/stream?token=${getToken()}`
}

export const getTrackStreamBlob = async (id: number): Promise<Blob> => {
  const res = await fetch(`${API_URL}/tracks/${id}/stream`, { headers: authHeaders() })
  if (!res.ok) throw new Error('Error al cargar el audio')
  return res.blob()
}

export const downloadTrack = async (id: number): Promise<void> => {
  await downloadBlob(`${API_URL}/tracks/${id}/download`, 'track.mp3')
}

export const downloadAlbumZip = async (id: number): Promise<void> => {
  await downloadBlob(`${API_URL}/albums/${id}/download`, 'album.zip')
}

export const downloadArtistZip = async (id: number): Promise<void> => {
  await downloadBlob(`${API_URL}/artists/${id}/download`, 'artist.zip')
}
