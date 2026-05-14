import { createI18n } from 'vue-i18n'
import en from './en.json'
import es from './es.json'

const savedLocale = localStorage.getItem('locale') || 'es'

export const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    es
  }
})

export const setLocale = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
}

export const getLocale = () => i18n.global.locale.value