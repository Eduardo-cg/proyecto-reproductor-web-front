<template>
  <div class="theme-grid">
    <button
      v-for="theme in themes"
      :key="theme.id"
      :class="['theme-card', { active: themeId === theme.id }]"
      :aria-label="t(`settings.themes.${theme.id}`)"
      @click="setTheme(theme.id)"
    >
      <div class="theme-preview">
        <span
          v-for="(color, i) in theme.palette"
          :key="i"
          class="theme-swatch"
          :style="{ background: color }"
        />
      </div>
      <span class="theme-name">{{ t(`settings.themes.${theme.id}`) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTheme } from '../../composables/useTheme';

const { t } = useI18n()
const { themeId, setTheme, themes } = useTheme()
</script>

<style scoped>
.theme-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
}

.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  cursor: pointer;
  transition: border-color var(--transition), background var(--transition);
}

.theme-card:hover {
  background: var(--accent-alpha);
}

.theme-card.active {
  border-color: var(--accent);
  background: var(--accent-alpha);
}

.theme-preview {
  display: flex;
  gap: 4px;
  align-items: center;
}

.theme-swatch {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.theme-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: capitalize;
}
</style>
