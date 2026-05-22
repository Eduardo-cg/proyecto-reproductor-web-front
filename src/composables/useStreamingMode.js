import { ref } from 'vue'

const STORAGE_KEY = 'streamingMode'
const MODES = { RANGE: 'range', BLOB: 'blob' }

const mode = ref(localStorage.getItem(STORAGE_KEY) || MODES.RANGE)

const setMode = (newMode) => {
  mode.value = newMode
  localStorage.setItem(STORAGE_KEY, newMode)
}

export function useStreamingMode() {
  return { mode, setMode, MODES }
}
