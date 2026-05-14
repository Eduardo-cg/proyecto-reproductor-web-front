import { reactive } from 'vue'

export const usePlayerStore = () => {
  const state = reactive({
    currentTrack: null,
    isPlaying: false,
    volume: 1,
    position: 0,
    duration: 0,
    queue: [],
    history: []
  })

  let audio = null

  const initAudio = () => {
    if (!audio) {
      audio = new Audio()
      audio.volume = state.volume

      audio.addEventListener('timeupdate', () => {
        state.position = audio.currentTime
      })

      audio.addEventListener('loadedmetadata', () => {
        state.duration = audio.duration
      })

      audio.addEventListener('ended', () => {
        state.isPlaying = false
        playNext()
      })
    }
  }

  const playTrack = (track) => {
    if (state.currentTrack) {
      state.history.push(state.currentTrack)
    }
    initAudio()
    state.currentTrack = track
    audio.src = track.url
    audio.play()
    state.isPlaying = true
  }

  const play = () => {
    if (audio) {
      audio.play()
      state.isPlaying = true
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
    if (state.position > 5) {
      seek(0)
    } else if (state.history.length > 0) {
      const prev = state.history.pop()
      playTrack(prev)
    }
  }

  const clearQueue = () => {
    state.queue = []
  }

  return {
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
    clearQueue
  }
}