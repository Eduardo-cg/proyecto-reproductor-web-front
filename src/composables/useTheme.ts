import type { Ref } from 'vue'
import { ref } from 'vue'
import { themes } from '../assets/styles/themes/index'
import type { ThemeId } from '../types'

const THEME_KEY = 'theme'
const DARK_KEY = 'darkMode'
const DEFAULT_THEME: ThemeId = 'warp'

const themeId: Ref<ThemeId> = ref(DEFAULT_THEME)
const isDark: Ref<boolean> = ref(false)
let initialized = false

function applyTheme(id: ThemeId): void {
  themeId.value = id
  document.documentElement.classList.remove('theme-warp', 'theme-midnight', 'theme-forest', 'theme-ocean', 'theme-retro')
  document.documentElement.classList.add(`theme-${id}`)
  localStorage.setItem(THEME_KEY, id)
}

function applyDark(dark: boolean): void {
  isDark.value = dark
  document.documentElement.classList.toggle('dark-mode', dark)
  localStorage.setItem(DARK_KEY, dark ? 'dark' : 'light')
}

export function useTheme() {
  if (!initialized) {
    const savedTheme = localStorage.getItem(THEME_KEY) as ThemeId || DEFAULT_THEME
    const savedDark = localStorage.getItem(DARK_KEY) === 'dark'
    document.documentElement.classList.add(`theme-${savedTheme}`)
    document.documentElement.classList.toggle('dark-mode', savedDark)
    themeId.value = savedTheme
    isDark.value = savedDark
    initialized = true
  }

  function setTheme(id: ThemeId): void {
    if (themes.some(t => t.id === id)) {
      applyTheme(id)
    }
  }

  function toggleDark(): void {
    applyDark(!isDark.value)
  }

  return { themeId, isDark, setTheme, toggleDark, themes }
}
