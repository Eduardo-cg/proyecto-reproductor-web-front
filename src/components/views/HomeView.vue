<template>
  <div class="home">
    <main class="container">
      <section class="hero">
        <div class="hero-content">
          <h1>{{ t('home.title', { appName: APP_NAME }) }}</h1>
          <p>{{ t('home.subtitle') }}</p>
        </div>
        <div class="hero-actions">
          <router-link
            to="/library"
            class="btn btn-primary"
            :aria-label="t('nav.library')"
          >
            <Icon
              name="music"
              size="16"
            />
            <span>{{ t('nav.library') }}</span>
          </router-link>
        </div>
      </section>

      <section class="about">
        <h2>{{ t('home.aboutTitle') }}</h2>
        <p>{{ t('home.aboutDescription') }}</p>
      </section>

      <section class="features">
        <h2>{{ t('home.featuresTitle') }}</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="play"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureStreamingTitle') }}</h3>
            <p>{{ t('home.featureStreamingDesc') }}</p>
          </div>
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="queue"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureQueueTitle') }}</h3>
            <p>{{ t('home.featureQueueDesc') }}</p>
          </div>
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="album"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureLibraryTitle') }}</h3>
            <p>{{ t('home.featureLibraryDesc') }}</p>
          </div>
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="upload"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureUploadTitle') }}</h3>
            <p>{{ t('home.featureUploadDesc') }}</p>
          </div>
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="settings"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureThemesTitle') }}</h3>
            <p>{{ t('home.featureThemesDesc') }}</p>
          </div>
          <div class="feature-card">
            <div
              class="feature-icon"
              aria-hidden="true"
            >
              <Icon
                name="info"
                size="24"
              />
            </div>
            <h3>{{ t('home.featureI18nTitle') }}</h3>
            <p>{{ t('home.featureI18nDesc') }}</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Icon from '../icons/Icon.vue';
import { APP_NAME } from '../../config';

const { t } = useI18n()
</script>

<style scoped>
.home {
  min-height: 100vh;
  padding-bottom: var(--player-height);
}

.hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 64px 0 48px;
}

.hero-content h1 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.8px;
}

.hero-content p {
  color: var(--text-secondary);
  font-size: 16px;
  max-width: 480px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}

.about {
  padding: 32px 0;
  border-top: 1px solid var(--border);
}

.about h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: -0.4px;
}

.about p {
  color: var(--text-secondary);
  font-size: 15px;
  line-height: 24px;
  max-width: 720px;
}

.features {
  padding: 32px 0 48px;
}

.features h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 20px;
  letter-spacing: -0.4px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.feature-card {
  background: var(--bg-secondary);
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: background var(--transition);
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

  .hero-content h1 {
    font-size: 26px;
  }

  .hero-content p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .hero {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
    text-align: center;
    padding: 24px 0;
  }

  .hero-content h1 {
    font-size: 22px;
  }

  .hero-actions {
    justify-content: center;
  }

  .features {
    padding: 24px 0 32px;
  }

  .features-grid {
    gap: 12px;
  }

  .feature-card {
    padding: 20px 16px;
  }
}
</style>
