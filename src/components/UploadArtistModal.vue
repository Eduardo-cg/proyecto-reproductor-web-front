<template>
  <template v-if="embedded">
    <div class="artist-form">
      <div class="artist-global-fields">
        <div class="artist-image-group" @click="$refs.imageInput.click()" :title="t('library.changeImage')">
          <img v-if="artistImage" :src="artistImage" alt="Artist" class="artist-image-img" />
          <div v-else class="artist-image-placeholder">🎤</div>
          <div class="artist-image-overlay">🖼</div>
          <input ref="imageInput" type="file" accept="image/*" class="file-input" @change="handleImageSelect" />
        </div>
        <div class="artist-meta-fields">
          <input v-model="artistName" :placeholder="t('library.artistName')" class="global-input" @keyup.enter="create" />
          <div class="field-hint">{{ t('library.clickToSelectImage') }}</div>
        </div>
      </div>

      <div class="artist-actions">
        <button class="btn btn-secondary" @click="reset">{{ t('library.cancel') }}</button>
        <button class="btn btn-primary" @click="create" :disabled="creating || !artistName.trim()">
          {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
        </button>
      </div>

      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </template>

  <div v-else-if="showUpload" class="modal" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('library.addArtist') }}</h3>
        <button class="btn-close" @click="close">&times;</button>
      </div>

      <div class="artist-form">
        <div class="artist-global-fields">
          <div class="artist-image-group" @click="$refs.imageInput.click()" :title="t('library.changeImage')">
            <img v-if="artistImage" :src="artistImage" alt="Artist" class="artist-image-img" />
            <div v-else class="artist-image-placeholder">🎤</div>
            <div class="artist-image-overlay">🖼</div>
            <input ref="imageInput" type="file" accept="image/*" class="file-input" @change="handleImageSelect" />
          </div>
          <div class="artist-meta-fields">
            <input v-model="artistName" :placeholder="t('library.artistName')" class="global-input" @keyup.enter="create" />
            <div class="field-hint">{{ t('library.clickToSelectImage') }}</div>
          </div>
        </div>

        <div class="artist-actions">
          <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="create" :disabled="creating || !artistName.trim()">
            {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
          </button>
        </div>

        <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../services/api'

const { t } = useI18n()

const props = defineProps({
  showUpload: { type: Boolean, required: true },
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:showUpload', 'created', 'uploaded'])

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
}

const close = () => {
  emit('update:showUpload', false)
  reset()
}

const create = async () => {
  if (!artistName.value.trim() || creating.value) return

  creating.value = true
  errorMessage.value = ''

  try {
    const artist = await api.createArtist(
      artistName.value.trim(),
      artistImageFile.value
    )
    emit('created', artist)
    emit('uploaded')
    reset()
    if (!props.embedded) {
      close()
    }
  } catch (e) {
    if (e.message.includes('already exists')) {
      errorMessage.value = t('library.artistAlreadyExists')
    } else {
      errorMessage.value = t('library.artistUploadError')
    }
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
  max-width: 480px;
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

.artist-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  border-radius: var(--radius-md);
  overflow: hidden;
  width: 96px;
  height: 96px;
}

.artist-image-img {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-md);
  object-fit: cover;
  display: block;
}

.artist-image-placeholder {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-md);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
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
  font-size: 24px;
  border-radius: var(--radius-md);
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
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
}

.global-input:focus {
  outline: 2px solid var(--accent);
  border-color: transparent;
}

.field-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

.file-input {
  display: none;
}

.artist-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.artist-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  font-size: 14px;
  padding: 10px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: var(--radius-sm);
  text-align: center;
}
</style>
