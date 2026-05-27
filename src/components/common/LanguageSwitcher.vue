<template>
  <div class="lang-switcher" role="radiogroup" aria-label="Idioma">
    <button v-for="lang in languages" :key="lang.code" :class="{ active: currentLocale === lang.code }"
      @click="changeLocale(lang.code)" role="radio" :aria-checked="currentLocale === lang.code">
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n'

const { locale } = useI18n()
const currentLocale = ref(locale.value)

const languages = [
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' }
]

const changeLocale = (code) => {
  setLocale(code)
  currentLocale.value = code
}
</script>

<style scoped>
.lang-switcher {
  display: flex;
  gap: 4px;
  width: 100%;
}

.lang-switcher button {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}

.lang-switcher button.active {
  background: var(--accent);
  color: var(--bg-primary);
}

.lang-switcher button:hover:not(.active) {
  background: var(--border);
}
</style>
