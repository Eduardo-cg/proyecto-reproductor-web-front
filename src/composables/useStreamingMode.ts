import type { Ref } from 'vue'
import { ref } from 'vue'
import type { StreamingMode } from '../types'

const STORAGE_KEY = 'streamingMode'
const MODES = { RANGE: 'range' as const, BLOB: 'blob' as const }

const mode: Ref<StreamingMode> = ref(localStorage.getItem(STORAGE_KEY) as StreamingMode || MODES.RANGE)

const setMode = (newMode: StreamingMode): void => {
  mode.value = newMode
  localStorage.setItem(STORAGE_KEY, newMode)
}

export function useStreamingMode() {
  return { mode, setMode, MODES }
}
