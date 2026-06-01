<template>
  <template v-if="showUpload && editMode && editData">
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      aria-label="Editar artista"
      @click.self="closeEdit"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ t('common.edit') + ': ' + editData.name }}</h3>
          <button
            class="btn-close"
            aria-label="Cerrar"
            @click="closeEdit"
          >
            <Icon
              name="close"
              size="20"
            />
          </button>
        </div>
        <div class="artist-form">
          <div class="artist-global-fields">
            <div
              class="artist-image-group"
              :title="t('library.changeImage')"
              role="button"
              tabindex="0"
              @click="editImageInput?.click()"
            >
              <img
                v-if="editImage"
                :src="editImage"
                alt=""
                class="artist-image-img"
              >
              <div
                v-else
                class="artist-image-placeholder"
                aria-hidden="true"
              >
                <Icon
                  name="artist"
                  size="32"
                />
              </div>
              <div
                class="artist-image-overlay"
                aria-hidden="true"
              >
                <Icon
                  name="upload"
                  size="20"
                />
              </div>
              <input
                ref="editImageInput"
                type="file"
                accept="image/*"
                class="file-input"
                @change="handleEditImageSelect"
              >
            </div>
            <div class="artist-meta-fields">
              <input
                v-model="editName"
                :placeholder="t('library.artistName')"
                class="global-input"
                @keyup.enter="saveEdit"
              >
            </div>
          </div>
          <div class="artist-actions">
            <button
              class="btn btn-primary"
              :disabled="editing || !editName.trim()"
              @click="saveEdit"
            >
              {{ editing ? t('common.saving') : t('common.save') }}
            </button>
          </div>
          <div
            v-if="errorMessage"
            class="error-message"
            role="alert"
          >
            {{ errorMessage }}
          </div>
        </div>
      </div>
    </div>
  </template>

  <template v-else-if="embedded">
    <div class="artist-form">
      <div class="artist-global-fields">
        <div
          class="artist-image-group"
          :title="t('library.changeImage')"
          role="button"
          tabindex="0"
          :aria-label="'Seleccionar imagen'"
          @click="imageInput?.click()"
        >
          <img
            v-if="artistImage"
            :src="artistImage"
            alt="Imagen del artista"
            class="artist-image-img"
          >
          <div
            v-else
            class="artist-image-placeholder"
            aria-hidden="true"
          >
            <Icon
              name="artist"
              size="32"
            />
          </div>
          <div
            class="artist-image-overlay"
            aria-hidden="true"
          >
            <Icon
              name="upload"
              size="20"
            />
          </div>
          <input
            ref="imageInput"
            type="file"
            accept="image/*"
            class="file-input"
            @change="handleImageSelect"
          >
        </div>
        <div class="artist-meta-fields">
          <input
            v-model="artistName"
            :placeholder="t('library.artistName')"
            class="global-input"
            @keyup.enter="create"
          >
        </div>
      </div>

      <div class="artist-actions">
        <button
          class="btn btn-primary"
          :disabled="creating || !artistName.trim()"
          @click="create"
        >
          {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
        </button>
      </div>

      <div
        v-if="errorMessage"
        class="error-message"
        role="alert"
      >
        {{ errorMessage }}
      </div>
    </div>
  </template>

  <div
    v-else-if="showUpload"
    class="modal"
    role="dialog"
    aria-modal="true"
    aria-label="Subir artista"
    @click.self="close"
  >
    <div class="modal-content">
      <div class="modal-header">
        <h3>{{ t('library.addArtist') }}</h3>
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
      <div class="artist-form">
        <div class="artist-global-fields">
          <div
            class="artist-image-group"
            :title="t('library.changeImage')"
            role="button"
            tabindex="0"
            :aria-label="'Seleccionar imagen'"
            @click="imageInput?.click()"
          >
            <img
              v-if="artistImage"
              :src="artistImage"
              alt="Imagen del artista"
              class="artist-image-img"
            >
            <div
              v-else
              class="artist-image-placeholder"
              aria-hidden="true"
            >
              <Icon
                name="artist"
                size="32"
              />
            </div>
            <div
              class="artist-image-overlay"
              aria-hidden="true"
            >
              <Icon
                name="upload"
                size="20"
              />
            </div>
            <input
              ref="imageInput"
              type="file"
              accept="image/*"
              class="file-input"
              @change="handleImageSelect"
            >
          </div>
          <div class="artist-meta-fields">
            <input
              v-model="artistName"
              :placeholder="t('library.artistName')"
              class="global-input"
              @keyup.enter="create"
            >
            <div class="field-hint">
              {{ t('library.clickToSelectImage') }}
            </div>
          </div>
        </div>

        <div class="artist-actions">
          <button
            class="btn btn-primary"
            :disabled="creating || !artistName.trim()"
            @click="create"
          >
            {{ creating ? t('library.artistCreating') : t('library.createArtist') }}
          </button>
        </div>

        <div
          v-if="errorMessage"
          class="error-message"
          role="alert"
        >
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import type { ArtistDTO } from '../../types'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()

interface EditData {
  id: number
  name?: string
  image?: string | null
}

const props = defineProps<{
  embedded?: boolean
  editMode?: boolean
  editData?: EditData | null
}>()

const showUpload = defineModel<boolean>('showUpload', { required: true })

const emit = defineEmits<{
  'uploaded': []
  'created': [artist: ArtistDTO]
  'close': []
}>()

const editName = ref('')
const editImage = ref<string | null>(null)
const editImageFile = ref<File | null>(null)
const editing = ref(false)
const editImageInput = ref<HTMLInputElement | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

watch(() => props.editData, (data) => {
  if (data && props.editMode) {
    editName.value = data.name || ''
    editImage.value = data.image || null
    editImageFile.value = null
  }
}, { immediate: true })

const handleEditImageSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    editImageFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      editImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  input.value = ''
}

const closeEdit = () => {
  showUpload.value = false
  editing.value = false
  errorMessage.value = ''
}

const saveEdit = async () => {
  if (!editName.value.trim() || editing.value || !props.editData) return
  editing.value = true
  errorMessage.value = ''
  try {
    await api.updateArtist(props.editData.id, editName.value.trim(), editImageFile.value || undefined)
    closeEdit()
    emit('uploaded')
  } catch (e: unknown) {
    errorMessage.value = (e instanceof Error ? e.message : null) || 'Error al actualizar el artista'
  } finally {
    editing.value = false
  }
}

const artistName = ref('')
const artistImage = ref<string | null>(null)
const artistImageFile = ref<File | null>(null)
const creating = ref(false)
const errorMessage = ref('')

const handleImageSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    artistImageFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      artistImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  input.value = ''
}

const reset = () => {
  artistName.value = ''
  artistImage.value = null
  artistImageFile.value = null
  errorMessage.value = ''
  if (props.embedded) {
    showUpload.value = false
  }
}

const close = () => {
  reset()
  showUpload.value = false
}

const create = async () => {
  if (!artistName.value.trim() || creating.value) return
  creating.value = true
  errorMessage.value = ''
  try {
    const artist = await api.createArtist(artistName.value.trim(), artistImageFile.value || undefined)
    emit('created', artist)
    emit('uploaded')
    emit('close')
    reset()
  } catch (e: unknown) {
    errorMessage.value = (e instanceof Error ? e.message : null) || 'Error al crear el artista'
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
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
  color: var(--danger);
  font-size: 13px;
  padding: 8px;
  background: var(--danger-bg);
  border-radius: var(--radius-sm);
  text-align: center;
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
