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
          <div class="settings-card user-card">
            <div class="user-card-top">
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
            <template v-if="authStore.state.isAuthenticated">
              <div class="user-card-divider"></div>
              <StorageBar :storage-data="storageData" />
            </template>
          </div>
        </section>

        <section class="settings-section">
          <h2>{{ t('settings.appearance') }}</h2>
          <div class="settings-card theme-card" @click="showThemePicker = !showThemePicker">
            <div class="theme-header">
              <span>{{ t('settings.theme') }}</span>
              <div class="theme-header-right">
                <span class="current-theme">{{ t(`settings.themes.${themeId}`) }}</span>
                <Icon :name="showThemePicker ? 'chevron-up' : 'chevron-down'" size="16" />
              </div>
            </div>
            <div v-show="showThemePicker" class="theme-picker-body" @click.stop>
              <ThemeSwitcher />
            </div>
          </div>
          <div class="settings-card dark-card">
            <DarkModeToggle />
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
            <div class="toggle-group">
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
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStreamingMode } from '../../composables/useStreamingMode'
import { useTheme } from '../../composables/useTheme'
import { useAuthStore } from '../../stores/authStore'
import DarkModeToggle from '../common/DarkModeToggle.vue'
import LanguageSwitcher from '../common/LanguageSwitcher.vue'
import StorageBar from '../common/StorageBar.vue'
import ThemeSwitcher from '../common/ThemeSwitcher.vue'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()
const { themeId } = useTheme()
const { mode, setMode, MODES } = useStreamingMode()

const showThemePicker = ref(false)
const storageData = ref(null)

onMounted(async () => {
  if (authStore.state.isAuthenticated) {
    try {
      const { api } = await import('../../services/api')
      storageData.value = await api.getStorageUsage()
    } catch {
      storageData.value = null
    }
  }
})

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

.user-card {
  gap: 0;
}

.user-card-top {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.user-card-divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  margin: 20px 0;
}

.dark-card {
  min-height: auto;
  padding: 12px 24px;
}

.theme-card {
  min-height: auto;
  padding: 0;
  cursor: pointer;
  gap: 0;
}

.theme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.theme-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.current-theme {
  font-size: 13px;
  color: var(--text-secondary);
  text-transform: capitalize;
}

.theme-picker-body {
  width: 100%;
  padding: 0 20px 16px;
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
