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
              <p class="user-name">{{ authStore.state.user?.username }}</p>
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

        <section class="settings-section">
          <h2>{{ t('settings.playback') }}</h2>
          <div class="settings-card streaming-card">
            <div class="streaming-toggle">
              <button :class="{ active: mode === MODES.RANGE }" @click="setMode(MODES.RANGE)">
                {{ t('settings.range') }}
              </button>
              <button :class="{ active: mode === MODES.BLOB }" @click="setMode(MODES.BLOB)">
                {{ t('settings.blob') }}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ThemeSwitcher from '../components/ThemeSwitcher.vue'
import { useStreamingMode } from '../composables/useStreamingMode'
import { useAuthStore } from '../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { mode, setMode, MODES } = useStreamingMode()

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.settings {
  min-height: 100vh;
  padding-bottom: 90px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
  position: relative;
}

.settings-header h1 {
  margin: 0;
}

.btn-back {
  position: absolute;
  left: 0;
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
  grid-template-columns: 1fr;
  gap: 20px;
  max-width: 500px;
  margin: 0 auto;
}

.settings-section {
  display: flex;
  flex-direction: column;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 16px;
  min-height: 130px;
  flex: 1;
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
}

.streaming-toggle {
  display: flex;
  gap: 5px;
}

.streaming-toggle button {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.streaming-toggle button.active {
  background: var(--accent);
  color: white;
}

.streaming-toggle button:hover:not(.active) {
  background: var(--border);
}
</style>
