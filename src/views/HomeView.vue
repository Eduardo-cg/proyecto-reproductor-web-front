<template>
  <div class="home">

    <main class="container">
      <h1>{{ t('home.title') }}</h1>
      <p>{{ t('home.subtitle') }}</p>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: 100px;
}

.container h1 {
  margin: 40px 0 10px;
}

.container p {
  color: var(--text-secondary);
  margin-bottom: 40px;
}

.btn-icon {
  background: var(--bg-tertiary);
  border: none;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 18px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.feature {
  background: var(--bg-secondary);
  padding: 30px;
  border-radius: var(--radius-lg);
  text-align: center;
}

.feature h3 {
  margin-bottom: 10px;
}

.feature p {
  color: var(--text-secondary);
}
</style>