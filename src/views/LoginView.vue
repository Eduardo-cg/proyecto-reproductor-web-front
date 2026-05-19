<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.loginTitle') }}</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>{{ t('auth.name') }}</label>
          <input v-model="name" type="text" required minlength="3" maxlength="30" />
        </div>
        <div class="form-group">
          <label>{{ t('auth.password') }}</label>
          <input v-model="password" type="password" required minlength="6" maxlength="128" />
        </div>
        <p v-if="authStore.state.error" class="error">{{ authStore.state.error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="authStore.state.loading">
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
import { useAuthStore } from '../stores/authStore'

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
  padding: 40px;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
}

.auth-card h2 {
  margin-bottom: 30px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.error {
  color: #e74c3c;
  margin-bottom: 15px;
  font-size: 14px;
}

.auth-card .btn {
  width: 100%;
  margin-top: 10px;
}

.switch-link {
  text-align: center;
  margin-top: 20px;
  color: var(--text-secondary);
}
</style>