<template>
  <button class="theme-switcher" @click="toggleTheme" :aria-label="isDark ? 'Activar modo claro' : 'Activar modo oscuro'">
    <Icon :name="isDark ? 'sun' : 'moon'" size="20" />
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme';
import Icon from './icons/Icon.vue'

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-switcher {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: background var(--transition);
}
.theme-switcher:hover {
  background: var(--accent-alpha);
}
</style>
