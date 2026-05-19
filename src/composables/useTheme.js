import { ref } from 'vue'

const THEME_KEY = 'theme'
const isDark = ref(false)
let initialized = false

function applyTheme(dark) {
  isDark.value = dark
  document.documentElement.classList.toggle('dark-mode', dark)
  localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light')
}

export function useTheme() {
  if (!initialized) {
    const saved = localStorage.getItem(THEME_KEY)
    isDark.value = saved === 'dark'
    document.documentElement.classList.toggle('dark-mode', isDark.value)
    initialized = true
  }

  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  return { isDark, toggleTheme }
}
