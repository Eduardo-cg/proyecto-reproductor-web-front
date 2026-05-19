<template>
  <div class="lang-switcher">
    <button v-for="lang in languages" :key="lang.code" :class="{ active: currentLocale === lang.code }"
      @click="changeLocale(lang.code)">
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../i18n'

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
  gap: 5px;
  width: 100%;
}

.lang-switcher button {
  flex: 1;
  padding: 6px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.lang-switcher button.active {
  background: var(--accent);
  color: white;
}

.lang-switcher button:hover:not(.active) {
  background: var(--border);
}
</style>