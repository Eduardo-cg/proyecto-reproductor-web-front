<template>
  <div class="not-found">
    <h1>{{ t('notfound.title') }}</h1>
    <p>{{ t('notfound.message') }}</p>
    <br />
    <router-link to="/" class="btn btn-primary">
      {{ t('notfound.home') }}
    </router-link>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n()
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 2rem;
}
</style>
