<template>
  <div v-if="show" class="modal" @click.self="close" role="dialog" aria-modal="true" aria-label="Subir contenido">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.add') }}</h3>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <Icon name="close" size="20" />
        </button>
      </div>

      <div class="upload-tabs" role="tablist" aria-label="Tipo de contenido">
        <button
          :class="['tab-btn', { active: activeTab === 'tracks' }]"
          @click="activeTab = 'tracks'"
          role="tab"
          :aria-selected="activeTab === 'tracks'">
          <Icon name="music" size="14" />
          {{ t('library.addTrack') }}
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'album' }]"
          @click="activeTab = 'album'"
          role="tab"
          :aria-selected="activeTab === 'album'">
          <Icon name="album" size="14" />
          {{ t('library.addAlbum') }}
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'artist' }]"
          @click="activeTab = 'artist'"
          role="tab"
          :aria-selected="activeTab === 'artist'">
          <Icon name="artist" size="14" />
          {{ t('library.addArtist') }}
        </button>
      </div>

      <div v-if="activeTab === 'tracks'" class="tab-content" role="tabpanel">
        <UploadSongsModal :showUpload="true" :embedded="true" @update:showUpload="close" @uploaded="onUploaded" />
      </div>

      <div v-else-if="activeTab === 'album'" class="tab-content" role="tabpanel">
        <UploadAlbumModal :showUpload="true" :embedded="true" @update:showUpload="close" @uploaded="onUploaded" />
      </div>

      <div v-else class="tab-content" role="tabpanel">
        <UploadArtistModal :showUpload="true" :embedded="true" @update:showUpload="close" @uploaded="onUploaded" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadSongsModal from './UploadSongsModal.vue'
import UploadAlbumModal from './UploadAlbumModal.vue'
import UploadArtistModal from './UploadArtistModal.vue'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()

defineProps({
  show: { type: Boolean, required: true }
})

const emit = defineEmits(['update:show', 'uploaded'])

const activeTab = ref('tracks')

const close = () => {
  emit('update:show', false)
}

const onUploaded = () => {
  close()
  emit('uploaded')
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 16px;
}

.modal-content {
  background: var(--bg-primary);
  padding: 24px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 680px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.btn-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}
.btn-close:hover {
  background: var(--accent-alpha);
  color: var(--text-primary);
}

.upload-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.upload-tabs .tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  transition: color var(--transition), border-color var(--transition);
}
.upload-tabs .tab-btn:hover {
  color: var(--text-primary);
}
.upload-tabs .tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.tab-content {
  min-height: 200px;
}

@media (max-width: 768px) {
  .modal {
    padding: 0;
    align-items: flex-start;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 0;
    height: 100vh;
    height: 100dvh;
    max-height: none;
    border: none;
    padding: 16px;
  }
}
</style>
