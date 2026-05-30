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

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref<string>('')
const password = ref<string>('')

const handleLogin = async () => {
  const success = await authStore.login(name.value, password.value)
  if (success) {
    router.push('/library')
  }
}
</script>
