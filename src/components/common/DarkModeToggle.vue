<template>
  <div class="dark-mode-toggle" role="radiogroup" :aria-label="t('settings.appearance')">
    <button :class="{ active: !isDark }" @click="toggleDark()" role="radio" :aria-checked="!isDark">
      <Icon name="sun" size="16" /> {{ t('settings.lightMode') }}
    </button>
    <button :class="{ active: isDark }" @click="toggleDark()" role="radio" :aria-checked="isDark">
      <Icon name="moon" size="16" /> {{ t('settings.darkMode') }}
    </button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()
const { isDark, toggleDark } = useTheme()
</script>

<style scoped>
.dark-mode-toggle {
  display: flex;
  gap: 4px;
  width: 100%;
}

.dark-mode-toggle button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}

.dark-mode-toggle button.active {
  background: var(--accent);
  color: var(--bg-primary);
}

.dark-mode-toggle button:hover:not(.active) {
  background: var(--border);
}
</style>
