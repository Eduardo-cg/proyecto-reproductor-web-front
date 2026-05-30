import type { ArtistDTO } from './artist'
import type { TrackDTO } from './track'

export interface Album {
  id: number
  title: string
  releaseDate?: string
  coverPath?: string
  userId: number
  createdAt?: string
  updatedAt?: string
}

export interface AlbumDTO {
  id: number
  title: string
  artists: ArtistDTO[]
  artist: string
  releaseDate?: string
  cover?: string
  userId: number
  trackCount: number
  totalSize: number
}

export interface AlbumWithTracksDTO extends AlbumDTO {
  tracks: TrackDTO[]
}

export interface AlbumCreate {
  title: string
  artistIds: number[]
  cover?: File
  releaseDate?: string
}

export interface AlbumUpdate {
  title: string
  artistIds: number[]
  releaseDate?: string
  cover?: File
}

export interface AlbumTrackUpload {
  title: string
  artistIds: number[]
  duration: number
  file: File
  position?: number
  releaseDate?: string
}
