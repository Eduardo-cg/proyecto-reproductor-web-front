<template>
  <nav class="navbar">
    <router-link to="/" class="logo">MusicApp</router-link>
    <div class="nav-links">
      <router-link to="/library">{{ t('nav.library') }}</router-link>
    </div>
    <div class="nav-bottom">
      <router-link v-if="!authStore.state.isAuthenticated" to="/login" class="nav-icon" :title="t('nav.login')">🔐</router-link>
      <button v-else @click="logout" class="nav-icon" :title="t('nav.logout')">🚪</button>
      <ThemeSwitcher />
      <LanguageSwitcher />
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import ThemeSwitcher from './ThemeSwitcher.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.navbar {
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
  z-index: 100;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: var(--accent);
  margin-bottom: 30px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: 15px;
  height: 100%;
}

.nav-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-bottom > * {
  width: 100%;
}

.nav-icon {
  background: var(--bg-tertiary);
  border: none;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 18px;
  text-decoration: none;
  text-align: center;
}
</style>

<style>
body {
  padding-left: 250px;
}
</style>