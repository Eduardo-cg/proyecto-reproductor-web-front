<template>
  <template v-if="embedded">
    <div class="artist-form">
      <div class="artist-global-fields">
        <div class="artist-image-group" @click="$refs.imageInput.click()" :title="t('library.changeImage')" role="button"
          tabindex="0" :aria-label="'Seleccionar imagen'">
          <img v-if="artistImage" :src="artistImage" alt="Imagen del artista" class="artist-image-img" />
          <div v-else class="artist-image-placeholder" aria-hidden="true">
            <Icon name="artist" size="32" />
          </div>
          <div class="artist-image-overlay" aria-hidden="true">
            <Icon name="upload" size="20" />
          </div>
          <input ref="imageInput" type="file" accept="image/*" class="file-input" @change="handleImageSelect" />
        </div>
        <div class="artist-meta-fields">
          <input v-model="artistName" :placeholder="t('library.artistName')" class="global-input" @keyup.enter="create" />
        </div>
      </div>

      <div class="artist-actions">
        <button class="btn btn-primary" @click="create" :disabled="creating || !artistName.trim()">
          {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
        </button>
      </div>

      <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
    </div>
  </template>

  <div v-else-if="showUpload" class="modal" @click.self="close" role="dialog" aria-modal="true" aria-label="Subir artista">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('library.addArtist') }}</h3>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <Icon name="close" size="20" />
        </button>
      </div>
      <div class="artist-form">
        <div class="artist-global-fields">
          <div class="artist-image-group" @click="$refs.imageInput.click()" :title="t('library.changeImage')" role="button"
            tabindex="0" :aria-label="'Seleccionar imagen'">
            <img v-if="artistImage" :src="artistImage" alt="Imagen del artista" class="artist-image-img" />
            <div v-else class="artist-image-placeholder" aria-hidden="true">
              <Icon name="artist" size="32" />
            </div>
            <div class="artist-image-overlay" aria-hidden="true">
              <Icon name="upload" size="20" />
            </div>
            <input ref="imageInput" type="file" accept="image/*" class="file-input" @change="handleImageSelect" />
          </div>
          <div class="artist-meta-fields">
            <input v-model="artistName" :placeholder="t('library.artistName')" class="global-input" @keyup.enter="create" />
            <div class="field-hint">{{ t('library.clickToSelectImage') }}</div>
          </div>
        </div>

        <div class="artist-actions">
          <button class="btn btn-primary" @click="create" :disabled="creating || !artistName.trim()">
            {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message" role="alert">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../services/api'
import Icon from './icons/Icon.vue'

const { t } = useI18n()

const props = defineProps({
  showUpload: { type: Boolean, required: true },
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:showUpload', 'uploaded', 'created'])

const artistName = ref('')
const artistImage = ref(null)
const artistImageFile = ref(null)
const creating = ref(false)
const errorMessage = ref('')

const handleImageSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    artistImageFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      artistImage.value = reader.result
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
}

const reset = () => {
  artistName.value = ''
  artistImage.value = null
  artistImageFile.value = null
  errorMessage.value = ''
  if (props.embedded) {
    emit('update:showUpload', false)
  }
}

const close = () => {
  reset()
  emit('update:showUpload', false)
}

const create = async () => {
  if (!artistName.value.trim() || creating.value) return
  creating.value = true
  errorMessage.value = ''
  try {
    const artist = await api.createArtist(artistName.value.trim(), artistImageFile.value || undefined)
    emit('created', artist)
    emit('uploaded')
    reset()
  } catch (e) {
    errorMessage.value = e.message || 'Error al crear el artista'
  } finally {
    creating.value = false
  }
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

.artist-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.artist-global-fields {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.artist-image-group {
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 80px;
  height: 80px;
}

.artist-image-img {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.artist-image-placeholder {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.artist-image-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: var(--radius-sm);
  color: white;
}
.artist-image-group:hover .artist-image-overlay {
  opacity: 1;
}

.artist-meta-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
}

.global-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}
.global-input:focus {
  outline: none;
  border-color: var(--accent);
}

.field-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.file-input {
  display: none;
}

.artist-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 24px;
}

.artist-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 13px;
  padding: 8px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: var(--radius-sm);
  text-align: center;
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

@media (max-width: 480px) {
  .artist-global-fields {
    flex-direction: column;
    align-items: center;
  }

  .artist-meta-fields {
    width: 100%;
  }

  .artist-image-group {
    width: 72px;
    height: 72px;
  }

  .artist-image-img,
  .artist-image-placeholder {
    width: 72px;
    height: 72px;
  }

  .artist-actions {
    flex-direction: column;
  }

  .artist-actions .btn {
    width: 100%;
    text-align: center;
  }
}
</style>
