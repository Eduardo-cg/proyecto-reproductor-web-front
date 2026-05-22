<template>
  <div id="app" :class="[`theme-${themeId}`, { 'dark-mode': isDark }]">
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup>
import PlayerBar from './components/PlayerBar.vue';
import { useTheme } from './composables/useTheme';

const { themeId, isDark } = useTheme()
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
