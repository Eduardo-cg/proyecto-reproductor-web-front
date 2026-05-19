<template>
  <div id="app" :class="{ 'dark-mode': isDark }">
    <NavBar />
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup>
import NavBar from './components/NavBar.vue';
import PlayerBar from './components/PlayerBar.vue';
import { useTheme } from './composables/useTheme';

const { isDark } = useTheme()
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
