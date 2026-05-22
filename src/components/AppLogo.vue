<template>
  <router-link to="/">
    <div class="app-logo">
      <slot>
        <span class="logo-text">{{ name }}</span>
      </slot>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  name: {
    type: String,
    default: 'MusicApp'
  }
})
</script>

<style scoped>
.app-logo {
  display: inline-flex;
  align-items: center;
  user-select: none;
}

.logo-text {
  font-size: 24px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent), #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
}
</style>
