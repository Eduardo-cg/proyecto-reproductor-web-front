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
        <button :class="['tab-btn', { active: activeTab === 'tracks' }]" @click="activeTab = 'tracks'" role="tab"
          :aria-selected="activeTab === 'tracks'">
          <Icon name="music" size="14" />
          {{ t('library.addTrack') }}
        </button>
        <button :class="['tab-btn', { active: activeTab === 'album' }]" @click="activeTab = 'album'" role="tab"
          :aria-selected="activeTab === 'album'">
          <Icon name="album" size="14" />
          {{ t('library.addAlbum') }}
        </button>
        <button :class="['tab-btn', { active: activeTab === 'artist' }]" @click="activeTab = 'artist'" role="tab"
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

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../icons/Icon.vue'
import UploadAlbumModal from './UploadAlbumModal.vue'
import UploadArtistModal from './UploadArtistModal.vue'
import UploadSongsModal from './UploadSongsModal.vue'

const { t } = useI18n()

defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  'uploaded': []
}>()

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
.upload-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.upload-tabs .tab-btn {
  padding: 10px 16px;
  font-size: 13px;
}

.tab-content {
  min-height: 200px;
}
</style>
