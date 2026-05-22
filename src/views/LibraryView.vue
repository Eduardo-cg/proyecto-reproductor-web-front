<template>
  <div class="library">
    <main class="container">
      <div class="header">
        <AppLogo />
        <div class="header-buttons">
          <button class="btn btn-primary" @click="showUploadModal = true" aria-label="Añadir contenido">
            <Icon name="plus" size="16" />
            {{ t('library.add') }}
          </button>
        </div>
      </div>

      <div class="view-tabs" role="tablist" aria-label="Vista de biblioteca">
        <button :class="['tab-btn', { active: viewMode === 'tracks' }]" @click="switchToTracks" role="tab"
          :aria-selected="viewMode === 'tracks'" :aria-controls="'panel-tracks'">
          <Icon name="music" size="16" />
          {{ t('library.tracks') }}
        </button>
        <button :class="['tab-btn', { active: viewMode === 'albums' }]" @click="switchToAlbums" role="tab"
          :aria-selected="viewMode === 'albums'" :aria-controls="'panel-albums'">
          <Icon name="album" size="16" />
          {{ t('library.albums') }}
        </button>
      </div>

      <div v-if="viewMode === 'tracks'" id="panel-tracks" role="tabpanel">
        <TracksView ref="tracksRef" />
      </div>
      <div v-if="viewMode === 'albums'" id="panel-albums" role="tabpanel">
        <AlbumsView ref="albumsRef" />
      </div>

      <UploadModal v-model:show="showUploadModal" @uploaded="handleUploaded" />
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLogo from '../components/AppLogo.vue'
import TracksView from '../components/TracksView.vue'
import AlbumsView from '../components/AlbumsView.vue'
import UploadModal from '../components/UploadModal.vue'
import Icon from '../components/icons/Icon.vue'

const { t } = useI18n()

const viewMode = ref('tracks')
const showUploadModal = ref(false)
const tracksRef = ref(null)
const albumsRef = ref(null)

const switchToTracks = () => {
  viewMode.value = 'tracks'
}

const switchToAlbums = () => {
  viewMode.value = 'albums'
}

const handleUploaded = () => {
  if (viewMode.value === 'tracks') {
    tracksRef.value?.refresh()
  } else {
    albumsRef.value?.refresh()
  }
}
</script>

<style scoped>
.library {
  min-height: 100vh;
  padding-bottom: var(--player-height);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.view-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color var(--transition), border-color var(--transition);
}
.tab-btn:hover {
  color: var(--text-primary);
}
.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
    margin: 16px 0;
  }

  .header-buttons {
    justify-content: center;
  }

  .tab-btn {
    padding: 10px 14px;
    font-size: 13px;
  }
}
</style>
