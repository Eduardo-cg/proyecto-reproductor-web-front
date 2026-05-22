<template>
  <div class="settings">
    <main class="container">
      <div class="settings-header">
        <button @click="router.back()" class="btn btn-back">← {{ t('common.back') }}</button>
        <h1>{{ t('settings.title') }}</h1>
      </div>

      <div class="settings-grid">
        <section class="settings-section">
          <h2>{{ t('settings.account') }}</h2>
          <div class="settings-card">
            <div class="user-avatar">👤</div>
            <template v-if="authStore.state.isAuthenticated">
              <p class="user-name">{{ authStore.state.user?.name }}</p>
              <button @click="logout" class="btn btn-secondary">
                🚪 {{ t('nav.logout') }}
              </button>
            </template>
            <template v-else>
              <p class="user-name">{{ t('settings.loginPrompt') }}</p>
              <router-link to="/login" class="btn btn-primary">
                🔐 {{ t('settings.login') }}
              </router-link>
            </template>
          </div>
        </section>

        <section class="settings-section">
          <h2>{{ t('settings.appearance') }}</h2>
          <div class="settings-card">
            <ThemeSwitcher />
          </div>
        </section>

        <section class="settings-section">
          <h2>{{ t('settings.language') }}</h2>
          <div class="settings-card">
            <LanguageSwitcher />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  padding-bottom: 100px;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 40px 0;
}

.settings-header h1 {
  margin: 0;
}

.btn-back {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  white-space: nowrap;
}

.btn-back:hover {
  background: var(--bg-tertiary);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.settings-section h2 {
  margin-bottom: 16px;
  color: var(--text-secondary);
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-card {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  flex: 1;
}
</style>
