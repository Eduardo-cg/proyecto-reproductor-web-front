<template>
  <div id="app" :class="[`theme-${themeId}`, { 'dark-mode': isDark }]">
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import PlayerBar from './components/player/PlayerBar.vue';
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
