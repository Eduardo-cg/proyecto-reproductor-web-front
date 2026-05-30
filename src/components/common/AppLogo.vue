<template>
  <router-link to="/" class="app-logo" aria-label="Ir al inicio">
    <span class="logo-text">{{ name }}</span>
  </router-link>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ name?: string }>(), { name: 'MusicApp' })
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  user-select: none;
  text-decoration: none;
}

.app-logo:hover {
  opacity: 0.85;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.5px;
}
</style>
