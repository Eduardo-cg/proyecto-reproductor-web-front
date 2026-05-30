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

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref<string>('')
const email = ref<string>('')
const password = ref<string>('')

const handleRegister = async () => {
  const success = await authStore.register(name.value, email.value, password.value)
  if (success) {
    router.push('/library')
  }
}
</script>
