<template>
  <div class="settings">
    <main class="container">
      <div class="settings-header">
        <button @click="router.back()" class="btn btn-secondary" aria-label="Volver">
          <Icon name="chevron-left" size="16" />
          {{ t('common.back') }}
        </button>
        <h1>{{ t('settings.title') }}</h1>
      </div>

      <div class="settings-grid">
        <section class="settings-section">
          <h2>{{ t('settings.account') }}</h2>
          <div class="settings-card">
            <div class="user-avatar" aria-hidden="true">
              <Icon name="artist" size="20" />
            </div>
            <template v-if="authStore.state.isAuthenticated">
              <p class="user-name">{{ authStore.state.user?.username }}</p>
              <button @click="logout" class="btn btn-secondary">
                <Icon name="logout" size="16" />
                {{ t('nav.logout') }}
              </button>
            </template>
            <template v-else>
              <p class="user-name">{{ t('settings.loginPrompt') }}</p>
              <router-link to="/login" class="btn btn-primary">
                {{ t('settings.login') }}
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
          <div class="settings-card">
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
import Icon from '../components/icons/Icon.vue'
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
  padding-bottom: var(--player-height);
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 32px 0;
  position: relative;
}

.settings-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.settings-header .btn {
  position: absolute;
  left: 0;
}

.settings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 500px;
  margin: 0 auto;
}

.settings-section {
  display: flex;
  flex-direction: column;
}

.settings-section h2 {
  margin-bottom: 12px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.settings-card {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
  min-height: 120px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.user-name {
  font-weight: 600;
  font-size: 15px;
}

.streaming-toggle {
  display: flex;
  gap: 4px;
  width: 100%;
}

.streaming-toggle button {
  flex: 1;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: background var(--transition), color var(--transition);
}
.streaming-toggle button.active {
  background: var(--accent);
  color: var(--bg-primary);
}
.streaming-toggle button:hover:not(.active) {
  background: var(--border);
}

@media (max-width: 480px) {
  .settings-header {
    margin: 20px 0;
  }

  .settings-header h1 {
    font-size: 18px;
  }

  .settings-card {
    padding: 20px 16px;
    min-height: 100px;
  }
}
</style>
