<template>
  <div class="home">
    <main class="container">
      <div class="hero">
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
      </div>
      <div class="features">
        <router-link to="/library" class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <Icon name="music" size="32" />
          </div>
          <h3>{{ t('nav.library') }}</h3>
          <p>{{ t('home.feature2Desc') }}</p>
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import Icon from '../components/icons/Icon.vue'

const { t } = useI18n()
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: var(--player-height);
}

.hero {
  padding: 64px 0 48px;
}

.hero h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.8px;
}

.hero p {
  color: var(--text-secondary);
  font-size: 16px;
  max-width: 480px;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.feature-card {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  text-align: center;
  transition: background var(--transition);
  color: var(--text-primary);
}
.feature-card:hover {
  background: var(--bg-tertiary);
}

.feature-icon {
  margin-bottom: 12px;
  color: var(--accent);
}

.feature-card h3 {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.feature-card p {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 20px;
}

@media (max-width: 768px) {
  .hero {
    padding: 40px 0 32px;
  }

  .hero h1 {
    font-size: 26px;
  }

  .hero p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 24px 0;
  }

  .hero h1 {
    font-size: 22px;
  }

  .features {
    gap: 12px;
  }

  .feature-card {
    padding: 20px 16px;
  }
}
</style>
