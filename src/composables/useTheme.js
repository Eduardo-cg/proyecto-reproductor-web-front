import { ref } from 'vue'
import { themes } from '../themes'

const THEME_KEY = 'theme'
const DARK_KEY = 'darkMode'
const DEFAULT_THEME = 'warp'

const themeId = ref(DEFAULT_THEME)
const isDark = ref(false)
let initialized = false

function applyTheme(id) {
  themeId.value = id
  document.documentElement.classList.remove('theme-warp', 'theme-midnight', 'theme-forest', 'theme-ocean', 'theme-retro')
  document.documentElement.classList.add(`theme-${id}`)
  localStorage.setItem(THEME_KEY, id)
}

function applyDark(dark) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark-mode', dark)
  localStorage.setItem(DARK_KEY, dark ? 'dark' : 'light')
}

export function useTheme() {
  if (!initialized) {
    const savedTheme = localStorage.getItem(THEME_KEY) || DEFAULT_THEME
    const savedDark = localStorage.getItem(DARK_KEY) === 'dark'
    document.documentElement.classList.add(`theme-${savedTheme}`)
    document.documentElement.classList.toggle('dark-mode', savedDark)
    themeId.value = savedTheme
    isDark.value = savedDark
    initialized = true
  }

  function setTheme(id) {
    if (themes.some(t => t.id === id)) {
      applyTheme(id)
    }
  }

  function toggleDark() {
    applyDark(!isDark.value)
  }

  return { themeId, isDark, setTheme, toggleDark, themes }
}
