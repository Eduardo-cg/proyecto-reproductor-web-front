<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.registerTitle') }}</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>{{ t('auth.name') }}</label>
          <input v-model="name" type="text" required />
        </div>
        <div class="form-group">
          <label>{{ t('auth.email') }}</label>
          <input v-model="email" type="email" required />
        </div>
        <div class="form-group">
          <label>{{ t('auth.password') }}</label>
          <input v-model="password" type="password" required />
        </div>
        <p v-if="authStore.state.error" class="error">{{ authStore.state.error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="authStore.state.loading">
          {{ authStore.state.loading ? t('auth.loading') : t('auth.submit') }}
        </button>
      </form>
      <p class="switch-link">
        {{ t('auth.hasAccount') }} <router-link to="/login">{{ t('auth.loginLink') }}</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')

const handleRegister = async () => {
  const success = await authStore.register(name.value, email.value, password.value)
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