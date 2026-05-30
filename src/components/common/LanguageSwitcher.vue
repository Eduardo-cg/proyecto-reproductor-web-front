<template>
  <div class="toggle-group" role="radiogroup" aria-label="Idioma">
    <button v-for="lang in languages" :key="lang.code" :class="{ active: currentLocale === lang.code }"
      @click="changeLocale(lang.code)" role="radio" :aria-checked="currentLocale === lang.code">
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'

const { locale } = useI18n()
const currentLocale = ref(locale.value as string)

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' }
]

const changeLocale = (code: string): void => {
  setLocale(code)
  currentLocale.value = code
}
</script>
