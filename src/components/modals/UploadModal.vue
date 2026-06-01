<template>
  <div
    v-if="show"
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label="Subir contenido"
    @click.self="close"
  >
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.add') }}</h3>
        <button
          class="btn-close"
          aria-label="Cerrar"
          @click="close"
        >
          <Icon
            name="close"
            size="20"
          />
        </button>
      </div>

      <div
        class="upload-tabs"
        role="tablist"
        aria-label="Tipo de contenido"
      >
        <button
          :class="['tab-btn', { active: activeTab === 'tracks' }]"
          role="tab"
          :aria-selected="activeTab === 'tracks'"
          @click="activeTab = 'tracks'"
        >
          <Icon
            name="music"
            size="14"
          />
          {{ t('library.addTrack') }}
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'album' }]"
          role="tab"
          :aria-selected="activeTab === 'album'"
          @click="activeTab = 'album'"
        >
          <Icon
            name="album"
            size="14"
          />
          {{ t('library.addAlbum') }}
        </button>
        <button
          :class="['tab-btn', { active: activeTab === 'artist' }]"
          role="tab"
          :aria-selected="activeTab === 'artist'"
          @click="activeTab = 'artist'"
        >
          <Icon
            name="artist"
            size="14"
          />
          {{ t('library.addArtist') }}
        </button>
      </div>

      <div
        v-if="activeTab === 'tracks'"
        class="tab-content"
        role="tabpanel"
      >
        <UploadSongsModal
          v-model:show-upload="alwaysOpen"
          :embedded="true"
          @uploaded="onUploaded"
        />
      </div>

      <div
        v-else-if="activeTab === 'album'"
        class="tab-content"
        role="tabpanel"
      >
        <UploadAlbumModal
          v-model:show-upload="alwaysOpen"
          :embedded="true"
          @uploaded="onUploaded"
        />
      </div>

      <div
        v-else
        class="tab-content"
        role="tabpanel"
      >
        <UploadArtistModal
          v-model:show-upload="alwaysOpen"
          :embedded="true"
          @uploaded="onUploaded"
        />
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

const show = defineModel<boolean>({ required: true })

const emit = defineEmits<{
  'uploaded': []
}>()

const activeTab = ref('tracks')
const alwaysOpen = ref(true)

const close = () => {
  show.value = false
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
