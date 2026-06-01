<template>
  <div
    id="app"
    :class="[`theme-${themeId}`, { 'dark-mode': isDark }]"
  >
    <router-view />
    <PlayerBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import PlayerBar from './components/player/PlayerBar.vue'
import { useTheme } from './composables/useTheme'
import { usePlayerStore } from './stores/playerStore'

const { themeId, isDark } = useTheme()
const { restoreLastTrack } = usePlayerStore()

onMounted(() => {
  restoreLastTrack()
})
</script>

<style>
#app {
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}
</style>
