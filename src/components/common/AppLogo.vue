<template>
  <router-link
    to="/"
    class="app-logo"
    aria-label="Ir al inicio"
  >
    <img
      src="@/assets/logo.svg"
      alt="FonoPort logo"
      class="logo-icon"
    >
    <span class="logo-text">{{ name }}</span>
  </router-link>
</template>

<script setup lang="ts">
import { APP_NAME } from '../../config'
withDefaults(defineProps<{ name?: string }>(), { name: APP_NAME })
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
  text-decoration: none;
}

.app-logo:hover {
  opacity: 0.85;
}

.logo-icon {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
  letter-spacing: -0.5px;
}
</style>
