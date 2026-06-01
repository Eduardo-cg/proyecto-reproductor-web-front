import type { AlbumDTO, ArtistDTO, PageResponse, TrackDTO } from '../types'
import { API_URL, authHeaders, downloadBlob, handleResponse } from './utils'

interface ArtistsResult {
  artists: ArtistDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
  pageSize: number
}

interface ArtistTracksResult {
  tracks: TrackDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
}

interface ArtistAlbumsResult {
  albums: AlbumDTO[]
  totalElements: number
  totalPages: number
  currentPage: number
}

export const getArtists = async (page: number = 0, size: number = 10, search: string = ''): Promise<ArtistsResult> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.set('search', search)
  const res = await fetch(`${API_URL}/artists?${params}`, { headers: authHeaders() })
  const data = await handleResponse<ArtistDTO[] | PageResponse<ArtistDTO>>(res, 'Error al obtener los artistas')
  if (Array.isArray(data)) {
    return { artists: data, totalElements: data.length, totalPages: Math.ceil(data.length / size) || 1, currentPage: page, pageSize: size }
  }
  return { artists: data.content || [], totalElements: data.totalElements || 0, totalPages: data.totalPages || 0, currentPage: data.currentPage != null ? data.currentPage : page, pageSize: data.pageSize || size }
}

export const getArtistsList = async (page: number = 0, size: number = 10, search: string = ''): Promise<ArtistsResult> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.set('search', search)
  const res = await fetch(`${API_URL}/artists/list?${params}`, { headers: authHeaders() })
  const data = await handleResponse<ArtistDTO[] | PageResponse<ArtistDTO>>(res, 'Error al obtener los artistas')
  if (Array.isArray(data)) {
    return { artists: data, totalElements: data.length, totalPages: Math.ceil(data.length / size) || 1, currentPage: page, pageSize: size }
  }
  return { artists: data.content || [], totalElements: data.totalElements || 0, totalPages: data.totalPages || 0, currentPage: data.currentPage != null ? data.currentPage : page, pageSize: data.pageSize || size }
}

export const getAlbumsList = async (artistIds: number[] = [], page: number = 0, size: number = 10, search: string = ''): Promise<ArtistAlbumsResult> => {
  const params = new URLSearchParams({ page: String(page), size: String(size) })
  if (search) params.set('search', search)
  if (artistIds.length > 0) params.set('artistIds', artistIds.join(','))
  const res = await fetch(`${API_URL}/albums/list?${params}`, { headers: authHeaders() })
  const data = await handleResponse<PageResponse<AlbumDTO>>(res, 'Error al obtener álbumes del artista')
  return { albums: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage }
}

export const downloadArtist = async (id: number): Promise<void> => {
  await downloadBlob(`${API_URL}/artists/${id}/download`, 'artist.zip')
}

export const getArtist = async (id: number): Promise<ArtistDTO> => {
  const res = await fetch(`${API_URL}/artists/${id}`, { headers: authHeaders() })
  return handleResponse<ArtistDTO>(res, 'Error al obtener el artista')
}

export const createArtist = async (name: string, image?: File): Promise<ArtistDTO> => {
  const formData = new FormData()
  formData.append('name', name)
  if (image) formData.append('image', image)
  const res = await fetch(`${API_URL}/artists`, { method: 'POST', headers: authHeaders(), body: formData })
  return handleResponse<ArtistDTO>(res, 'Error al crear el artista')
}

export const updateArtist = async (id: number, name: string, image?: File): Promise<ArtistDTO> => {
  const formData = new FormData()
  if (name != null) formData.append('name', name)
  if (image) formData.append('image', image)
  const res = await fetch(`${API_URL}/artists/${id}`, { method: 'PUT', headers: authHeaders(), body: formData })
  return handleResponse<ArtistDTO>(res, 'Error al actualizar el artista')
}

export const deleteArtist = async (id: number): Promise<void> => {
  const res = await fetch(`${API_URL}/artists/${id}`, { method: 'DELETE', headers: authHeaders() })
  if (!res.ok) throw new Error('Error al eliminar el artista')
}

export const getArtistTracks = async (id: number, page: number = 0, size: number = 10): Promise<ArtistTracksResult> => {
  const res = await fetch(`${API_URL}/artists/${id}/tracks?page=${page}&size=${size}`, { headers: authHeaders() })
  const data = await handleResponse<PageResponse<TrackDTO>>(res, 'Error al obtener canciones del artista')
  return { tracks: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage }
}

export const getArtistAlbums = async (id: number, page: number = 0, size: number = 10): Promise<ArtistAlbumsResult> => {
  const res = await fetch(`${API_URL}/artists/${id}/albums?page=${page}&size=${size}`, { headers: authHeaders() })
  const data = await handleResponse<PageResponse<AlbumDTO>>(res, 'Error al obtener álbumes del artista')
  return { albums: data.content, totalElements: data.totalElements, totalPages: data.totalPages, currentPage: data.currentPage }
}
