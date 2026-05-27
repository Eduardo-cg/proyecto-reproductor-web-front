<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>{{ t('auth.registerTitle') }}</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="reg-name">{{ t('auth.name') }}</label>
          <input id="reg-name" v-model="name" type="text" required minlength="3" maxlength="30" />
        </div>
        <div class="form-group">
          <label for="reg-email">{{ t('auth.email') }}</label>
          <input id="reg-email" v-model="email" type="email" required maxlength="255" />
        </div>
        <div class="form-group">
          <label for="reg-password">{{ t('auth.password') }}</label>
          <input id="reg-password" v-model="password" type="password" required minlength="6" maxlength="128" />
        </div>
        <p v-if="authStore.state.error" class="error" role="alert">{{ authStore.state.error }}</p>
        <button type="submit" class="btn btn-primary" :disabled="authStore.state.loading" style="width:100%">
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
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

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
