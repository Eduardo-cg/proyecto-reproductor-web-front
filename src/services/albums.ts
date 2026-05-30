import type { AlbumDTO, AlbumWithTracksDTO, PageResponse } from '../types'
import { API_URL, authHeaders, handleResponse } from './utils'

interface AlbumsResult {
  albums: AlbumDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

export const getAlbums = async (
  page: number = 0,
  size: number = 20,
  search: string = '',
  artistIds: number[] = [],
  sortBy: string = 'title',
  sortDirection: string = 'asc'
): Promise<AlbumsResult> => {
  const params = new URLSearchParams({ page: String(page), size: String(size), sortBy, sortDirection })
  if (search) params.set('search', search)
  if (artistIds.length > 0) params.set('artistIds', artistIds.join(','))
  const res = await fetch(`${API_URL}/albums?${params}`, { headers: authHeaders() })
  const data = await handleResponse<PageResponse<AlbumDTO>>(res, 'Error al obtener los álbumes')
  return { albums: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage, pageSize: data.pageSize }
}

export const getAlbum = async (id: number): Promise<AlbumWithTracksDTO> => {
  const res = await fetch(`${API_URL}/albums/${id}`, { headers: authHeaders() })
  return handleResponse<AlbumWithTracksDTO>(res, 'Error al obtener el álbum')
}

export const createAlbum = async (title: string, artistIds: number[], cover?: File, releaseDate?: string): Promise<AlbumDTO> => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse<AlbumDTO>(res, 'Error al crear el álbum')
}

export const updateAlbum = async (id: number, title: string, artistIds: number[], releaseDate?: string, cover?: File): Promise<AlbumDTO> => {
  const formData = new FormData()
  if (title != null) formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  if (cover) formData.append('cover', cover)
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse<AlbumDTO>(res, 'Error al actualizar el álbum')
}

export const deleteAlbum = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/albums/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar el álbum')
}

export const reorderAlbumTracks = async (albumId: number, trackIds: number[]): Promise<void> => {
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks/reorder`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(trackIds)
  })
  if (!res.ok) throw new Error('Error al reordenar las canciones')
}

export const deleteAlbumTrack = async (albumId: number, trackId: number): Promise<void> => {
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks/${trackId}`, {
    method: 'DELETE',
    headers: authHeaders()
  })
  if (!res.ok) throw new Error('Error al eliminar la canción del álbum')
}

export const uploadAlbumTrack = async (
  albumId: number,
  title: string,
  artistIds: number[],
  duration: number,
  file: File,
  position?: number,
  releaseDate?: string
): Promise<AlbumDTO> => {
  const formData = new FormData()
  formData.append('title', title)
  if (artistIds && artistIds.length > 0) formData.append('artistIds', JSON.stringify(artistIds))
  formData.append('duration', String(duration))
  formData.append('file', file)
  if (position != null) formData.append('position', String(position))
  if (releaseDate) formData.append('releaseDate', releaseDate)
  const res = await fetch(`${API_URL}/albums/${albumId}/tracks`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }, body: formData })
  return handleResponse<AlbumDTO>(res, 'Error al subir canción al álbum')
}
