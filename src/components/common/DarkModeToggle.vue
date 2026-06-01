<template>
  <div
    class="toggle-group"
    role="radiogroup"
    :aria-label="t('settings.appearance')"
  >
    <button
      :class="{ active: !isDark }"
      role="radio"
      :aria-checked="!isDark"
      @click="toggleDark()"
    >
      <Icon
        name="sun"
        size="16"
      /> {{ t('settings.lightMode') }}
    </button>
    <button
      :class="{ active: isDark }"
      role="radio"
      :aria-checked="isDark"
      @click="toggleDark()"
    >
      <Icon
        name="moon"
        size="16"
      /> {{ t('settings.darkMode') }}
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
