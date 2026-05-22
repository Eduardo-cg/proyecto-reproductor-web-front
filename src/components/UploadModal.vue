<template>
  <div v-if="show" class="modal" @click.self="close">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.add') }}</h3>
        <button class="btn-close" @click="close">&times;</button>
      </div>

      <div class="upload-tabs">
        <button
          :class="['tab-btn', { active: activeTab === 'tracks' }]"
          @click="activeTab = 'tracks'"
        >{{ t('library.addTrack') }}</button>
        <button
          :class="['tab-btn', { active: activeTab === 'album' }]"
          @click="activeTab = 'album'"
        >{{ t('library.addAlbum') }}</button>
        <button
          :class="['tab-btn', { active: activeTab === 'artist' }]"
          @click="activeTab = 'artist'"
        >{{ t('library.addArtist') }}</button>
      </div>

      <div v-if="activeTab === 'tracks'" class="tab-content">
        <UploadSongsModal :showUpload="true" :embedded="true" @update:showUpload="close" @uploaded="onUploaded" />
      </div>

      <div v-else-if="activeTab === 'album'" class="tab-content">
        <UploadAlbumModal :showUpload="true" :embedded="true" @update:showUpload="close" @uploaded="onUploaded" />
      </div>

      <div v-else class="tab-content">
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: var(--bg-secondary);
  padding: 30px;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
}

.modal-large {
  max-width: 720px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
}

.btn-close:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.upload-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 2px solid var(--border);
}

.upload-tabs .tab-btn {
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
</style>
