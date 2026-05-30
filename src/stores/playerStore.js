import { reactive } from 'vue'
import { initMediaSession, updateMetadata, updatePlaybackState } from '../composables/useMediaSession'
import { useStreamingMode } from '../composables/useStreamingMode'
import { api } from '../services/api'

let audio = null
let currentBlobUrl = null
let eventListenersBound = false

const revokeCurrentBlob = () => {
  if (currentBlobUrl) {
    URL.revokeObjectURL(currentBlobUrl)
    currentBlobUrl = null
  }
}

const state = reactive({
  currentTrack: null,
  isPlaying: false,
  volume: 1,
  position: 0,
  duration: 0,
  queue: [],
  backQueue: []
})

const bindEventListeners = () => {
  if (eventListenersBound) return
  eventListenersBound = true

  window.addEventListener('beforeunload', () => {
    if (state.currentTrack?.id) {
      localStorage.setItem('currentTrackId', state.currentTrack.id);
    } else {
      localStorage.removeItem('currentTrackId');
    }
  })

  window.addEventListener('media-session-previous', () => playPrevious())
  window.addEventListener('media-session-next', () => playNext())
  window.addEventListener('media-session-toggle', () => togglePlay())
}

const initAudio = () => {
  if (!audio) {
    audio = new Audio()
    audio.volume = state.volume
    initMediaSession(audio)

    audio.addEventListener('timeupdate', () => {
      state.position = audio.currentTime
    })

    audio.addEventListener('loadedmetadata', () => {
      state.duration = audio.duration
    })

    audio.addEventListener('play', () => {
      state.isPlaying = true
      updatePlaybackState(true)
    })

    audio.addEventListener('pause', () => {
      state.isPlaying = false
      updatePlaybackState(false)
    })

    audio.addEventListener('ended', () => {
      state.isPlaying = false
      playNext()
    })

    audio.addEventListener('error', () => {
      state.isPlaying = false
    })

    bindEventListeners()
  }
}

const playTrack = async (track, fromBackQueue = false) => {
  if (state.currentTrack && !fromBackQueue) {
    state.backQueue.push(state.currentTrack)
  }
  initAudio()
  state.currentTrack = track
  updateMetadata(track)

  if (audio.src) {
    audio.pause()
    audio.src = ''
  }

  revokeCurrentBlob()

  try {
    const { mode, MODES } = useStreamingMode()
    if (mode.value === MODES.RANGE) {
      audio.src = api.getStreamUrl(track.id)
    } else {
      const blob = await api.getTrackStreamBlob(track.id)
      currentBlobUrl = URL.createObjectURL(blob)
      audio.src = currentBlobUrl
    }
    await audio.play()
    state.isPlaying = true
    updatePlaybackState(true)
  } catch (e) {
    console.error('Error playing track:', e)
    state.isPlaying = false
    revokeCurrentBlob()
  }
}

const storedTrackId = localStorage.getItem('currentTrackId');

if (storedTrackId) {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    try {
      const track = await api.getTrack(storedTrackId)
      state.currentTrack = track
    } catch (e) {
      console.error('Error al restaurar canción:', e)
      localStorage.removeItem('currentTrackId')
    }
  }
}

const play = () => {
  if (audio) {
    audio.play()
    state.isPlaying = true
  } else if (state.currentTrack) {
    playTrack(state.currentTrack)
  }
}

const pause = () => {
  if (audio) {
    audio.pause()
    state.isPlaying = false
  }
}

const togglePlay = () => {

  state.isPlaying ? pause() : play()
}

const seek = (time) => {
  if (audio) {
    audio.currentTime = time
    state.position = time
  }
}

const setVolume = (vol) => {
  state.volume = vol
  if (audio) {
    audio.volume = vol
  }
}

const addToQueue = (track) => {
  state.queue.push(track)
}

const playNext = () => {
  if (state.queue.length > 0) {
    const next = state.queue.shift()
    playTrack(next)
  }
}

const playPrevious = () => {
  if (state.position > 3) {
    seek(0)
  } else if (state.backQueue.length > 0) {
    const prev = state.backQueue.pop()
    if (state.currentTrack) {
      state.queue.unshift(state.currentTrack)
    }
    playTrack(prev, true)
  } else {
    seek(0)
  }
}

const clearQueue = () => {
  state.queue.length = 0
}

const playFromQueue = (index) => {
  if (index < 0 || index >= state.queue.length) return
  const removed = state.queue.splice(0, index + 1)
  const track = removed[index]
  playTrack(track)
}

const removeFromQueue = (index) => {
  state.queue.splice(index, 1)
}

const reorderQueue = (newQueue) => {
  state.queue.splice(0, state.queue.length, ...newQueue)
}

const mute = () => {
  if (state.volume === 0) {
    state.volume = 1
  } else {
    state.volume = 0
  }
  if (audio) {
    audio.volume = state.volume
  }
}

export const usePlayerStore = () => ({
  state,
  playTrack,
  play,
  pause,
  togglePlay,
  seek,
  setVolume,
  addToQueue,
  playNext,
  playPrevious,
  clearQueue,
  playFromQueue,
  removeFromQueue,
  reorderQueue,
  mute
})
