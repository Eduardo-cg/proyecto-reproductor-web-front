export interface Artist {
  id: number
  name: string
  imagePath?: string
  userId: number
  createdAt?: string
  updatedAt?: string
}

export interface ArtistDTO {
  id: number
  name: string
  image?: string
  userId: number
  trackCount: number
  albumCount: number
}

export interface ArtistCreate {
  name: string
  image?: File
}

export type ArtistUpdate = ArtistCreate
