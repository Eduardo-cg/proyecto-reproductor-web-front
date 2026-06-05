import type { IAudioMetadata } from 'music-metadata'

export const formatDuration = (seconds: number | undefined | null): string => {
  if (!seconds || isNaN(seconds)) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const formatFileSize = (bytes: number | undefined | null): string => {
  if (bytes == null || bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const size = (bytes / Math.pow(k, i)).toFixed(i > 0 ? 1 : 0)
  return `${size} ${i > 0 ? ' ' + units[i] : ' B'}`
}

export const arrayBufferToBase64 = (data: ArrayBuffer | Uint8Array): string => {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  const CHUNK = 8192
  let result = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK)
    result += String.fromCharCode(...chunk)
  }
  return btoa(result)
}

export const titleFromFile = (file: File, metadataTitle?: string): string => {
  if (file.name.toLowerCase().endsWith('.wav')) return file.name.replace(/\.[^/.]+$/, '')
  return metadataTitle || file.name.replace(/\.[^/.]+$/, '')
}

export interface CoverExtraction {
  dataUrl: string
  file: File
}

export const extractCover = (metadata: IAudioMetadata): CoverExtraction | null => {
  const pic = metadata.common.picture?.[0]
  if (!pic) return null
  const data = new Uint8Array(pic.data)
  return {
    dataUrl: `data:${pic.format};base64,${arrayBufferToBase64(data)}`,
    file: new File([data], 'cover.jpg', { type: pic.format })
  }
}
