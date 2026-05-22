<template>
  <div class="library">
    <main class="container">
      <div class="header">
        <AppLogo />
        <div class="header-buttons">
          <button class="btn btn-primary" @click="showUploadModal = true">+ {{ t('library.add') }}</button>
        </div>
      </div>

      <div class="view-tabs">
        <button :class="['tab-btn', { active: viewMode === 'tracks' }]" @click="switchToTracks">{{ t('library.tracks')
          }}</button>
        <button :class="['tab-btn', { active: viewMode === 'albums' }]" @click="switchToAlbums">{{ t('library.albums')
          }}</button>
      </div>

      <TracksView v-if="viewMode === 'tracks'" ref="tracksRef" />
      <AlbumsView v-if="viewMode === 'albums'" ref="albumsRef" />

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
  padding-bottom: 120px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.view-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border);
}

.tab-btn {
  padding: 10px 24px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}
</style>
