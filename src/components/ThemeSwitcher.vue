<template>
  <button class="theme-switcher" @click="toggleTheme" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme';

const { isDark, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-switcher {
  background: var(--bg-tertiary);
  border: none;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 18px;
  width: 100%;
}
</style>
