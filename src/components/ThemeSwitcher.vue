<template>
  <button class="theme-switcher" @click="toggleTheme" :title="isDark ? 'Modo Claro' : 'Modo Oscuro'">
    {{ isDark ? '☀️' : '🌙' }}
  </button>
</template>

<script setup>
import { ref } from 'vue'

const savedTheme = localStorage.getItem('theme')
const isDark = ref(savedTheme !== 'light')

document.documentElement.classList.toggle('dark-mode', isDark.value)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
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