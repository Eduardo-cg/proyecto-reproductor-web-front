<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.loginTitle') }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-name">{{ t('auth.name') }}</label>
          <input id="login-name" v-model="name" type="text" required minlength="3" maxlength="30" />
        </div>
        <div class="form-group">
          <label for="login-password">{{ t('auth.password') }}</label>
          <input id="login-password" v-model="password" type="password" required minlength="6" maxlength="128" />
        </div>
        <p v-if="authStore.state.error" class="error" role="alert">{{ authStore.state.error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="authStore.state.loading" style="width:100%">
          {{ authStore.state.loading ? t('auth.loading') : t('auth.submit') }}
        </button>
      </form>
      <p class="switch-link">
        {{ t('auth.noAccount') }} <router-link to="/register">{{ t('auth.registerLink') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const password = ref('')

const handleLogin = async () => {
  const success = await authStore.login(name.value, password.value)
  if (success) {
    router.push('/library')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.auth-card {
  background: var(--bg-secondary);
  padding: 32px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  margin-bottom: 24px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 14px;
}

.error {
  color: var(--accent);
  margin-bottom: 12px;
  font-size: 14px;
}

.switch-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 480px) {
  .auth-page {
    padding: 12px;
  }

  .auth-card {
    padding: 24px 20px;
  }
}
</style>
