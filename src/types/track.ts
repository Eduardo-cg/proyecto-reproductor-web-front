import type { ArtistDTO } from './artist'

export interface Track {
  id: number
  title: string
  album?: string
  duration?: number
  filePath?: string
  fileSize?: number
  coverPath?: string
  userId: number
  releaseDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface TrackDTO {
  id: number
  title: string
  artists: ArtistDTO[]
  artist: string
  album?: string
  duration?: number
  fileSize?: number
  cover?: string
  userId: number
  releaseDate?: string
}

export interface TrackCreate {
  title: string
  artistIds: number[]
  duration: number
  file: File
  album?: string
  albumId?: number
  cover?: File
  releaseDate?: string
}

export interface TrackUpdate {
  title: string
  artistIds: number[]
  album?: string
  releaseDate?: string
  cover?: File
}
