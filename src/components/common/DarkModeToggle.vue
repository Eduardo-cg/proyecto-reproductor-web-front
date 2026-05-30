<template>
  <div class="toggle-group" role="radiogroup" :aria-label="t('settings.appearance')">
    <button :class="{ active: !isDark }" @click="toggleDark()" role="radio" :aria-checked="!isDark">
      <Icon name="sun" size="16" /> {{ t('settings.lightMode') }}
    </button>
    <button :class="{ active: isDark }" @click="toggleDark()" role="radio" :aria-checked="isDark">
      <Icon name="moon" size="16" /> {{ t('settings.darkMode') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()
const { isDark, toggleDark } = useTheme()
</script>
