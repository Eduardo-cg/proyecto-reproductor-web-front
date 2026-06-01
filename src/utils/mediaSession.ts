import type { TrackDTO } from '../types'

let audioElement: HTMLAudioElement | null = null

export function initMediaSession(audio: HTMLAudioElement): void {
  audioElement = audio

  if (!('mediaSession' in navigator)) {
    console.warn('Media Session API not supported')
    return
  }

  navigator.mediaSession.setActionHandler('play', () => {
    audioElement?.play()
  })

  navigator.mediaSession.setActionHandler('pause', () => {
    audioElement?.pause()
  })

  navigator.mediaSession.setActionHandler('previoustrack', () => {
    window.dispatchEvent(new CustomEvent('media-session-previous'))
  })

  navigator.mediaSession.setActionHandler('nexttrack', () => {
    window.dispatchEvent(new CustomEvent('media-session-next'))
  })

  navigator.mediaSession.setActionHandler('seekto', (details) => {
    if (audioElement && details.seekTime != null) {
      audioElement.currentTime = details.seekTime
    }
  })
}

export function updateMetadata(track: TrackDTO): void {
  if (!('mediaSession' in navigator) || !track) return

  const metadata = new MediaMetadata({
    title: track.title || 'Unknown Title',
    artist: track.artist || 'Unknown Artist',
    album: track.album || 'Unknown Album',
    artwork: track.cover
      ? [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }]
      : []
  })

  navigator.mediaSession.metadata = metadata
}

export function updatePlaybackState(isPlaying: boolean): void {
  if (!('mediaSession' in navigator)) return
  navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused'
}

let keyboardHandler: ((e: KeyboardEvent) => void) | null = null

export function setupKeyboardShortcuts(): void {
  if (keyboardHandler) return

  keyboardHandler = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return
    if (e.code === 'Space') {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('media-session-toggle'))
    }
  }

  window.addEventListener('keydown', keyboardHandler)
}

export function cleanupKeyboardShortcuts(): void {
  if (keyboardHandler) {
    window.removeEventListener('keydown', keyboardHandler)
    keyboardHandler = null
  }
}
