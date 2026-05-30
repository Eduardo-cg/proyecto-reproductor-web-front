<template>
  <template v-if="showUpload && editMode && editData">
    <div class="modal" @click.self="closeEdit" role="dialog" aria-modal="true" aria-label="Editar canción">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>{{ t('common.edit') + ': ' + editData.title }}</h3>
          <button class="btn-close" @click="closeEdit" aria-label="Cerrar">
            <Icon name="close" size="20" />
          </button>
        </div>
        <div class="edit-form">
          <div class="edit-cover" @click="editCoverInput?.click()" :title="t('library.changeCover')" role="button"
            tabindex="0">
            <img v-if="editCover" :src="editCover" alt="" class="edit-cover-img" />
            <div v-else class="edit-cover-placeholder" aria-hidden="true">
              <Icon name="music" size="24" />
            </div>
            <div class="edit-cover-overlay" aria-hidden="true">
              <Icon name="upload" size="20" />
            </div>
            <input ref="editCoverInput" type="file" accept="image/*" class="file-input"
              @change="handleEditCoverSelect" />
          </div>
          <div class="edit-fields">
            <input v-model="editTitle" :placeholder="t('library.trackTitle')" class="preview-input" />
            <ArtistSelector v-model="editArtistIds" :compact="false"
              :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <input v-model="editAlbum" :placeholder="t('library.album')" class="preview-input" />
            <input v-model="editReleaseDate" type="date" :placeholder="t('library.releaseDate')"
              :title="t('library.releaseDate')" class="preview-input" />
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="closeEdit">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="editing || !editTitle.trim()">
            {{ editing ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </template>

  <template v-else-if="embedded">
    <div v-if="!pendingFiles.length" class="upload-step">
      <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="fileInput?.click()" role="button"
        :aria-label="t('library.dragDropZone')" tabindex="0" @keydown.enter.prevent="fileInput?.click()"
        @keydown.space.prevent="fileInput?.click()">
        <input ref="fileInput" type="file"
          accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
          class="file-input" @change="handleFileSelect" aria-hidden="true" />
        <Icon name="upload" size="48" class="drop-zone-icon" />
        <div class="drop-zone-text">{{ t('library.dragDropZone') }}</div>
        <div class="drop-zone-formats">{{ t('library.acceptedFormats') }}</div>
      </div>
    </div>

    <div v-else class="preview-step">
      <div class="global-artist-section">
        <ArtistSelector v-model="globalArtistIds" :compact="true"
          :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
        <button type="button" class="btn-apply-to-all" @click="applyArtistsToAll" :disabled="!globalArtistIds.length">
          <Icon name="check" size="14" />
          {{ t('library.applyToAll') || 'Aplicar a todas' }}
        </button>
      </div>

      <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
      <div class="preview-list">
        <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
          <div class="preview-cover">
            <img v-if="file.cover" :src="file.cover" alt="" class="preview-cover-img" />
            <div v-else class="preview-cover-placeholder" aria-hidden="true">
              <Icon name="music" size="20" />
            </div>
          </div>
          <div class="preview-fields">
            <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
            <ArtistSelector v-model="file.artistIds" :compact="true"
              :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <input v-model="file.album" :placeholder="t('library.album')" class="preview-input" />
            <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')"
              :title="t('library.releaseDate')" class="preview-input" />
            <div class="preview-meta">
              <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
              <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
              <span class="meta-file">{{ file.fileName }}</span>
            </div>
          </div>
          <button class="btn-remove-file" @click="removeFile(index)"
            :aria-label="'Eliminar ' + (file.title || file.fileName)">
            <Icon name="close" size="16" />
          </button>
        </div>
      </div>
      <div v-if="storageError" class="storage-error">
        <Icon name="close" size="16" />
        {{ storageError }}
      </div>
      <div class="preview-actions">
        <button class="btn btn-secondary" @click="close">
          {{ t('library.cancel') }}
        </button>
        <button class="btn btn-primary" @click="upload" :disabled="uploading">
          {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}',
            String(pendingFiles.length)) }}
        </button>
      </div>
    </div>
  </template>

  <div v-else-if="showUpload" class="modal" @click.self="close" role="dialog" aria-modal="true"
    aria-label="Subir canciones">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.addTrack') }}</h3>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <Icon name="close" size="20" />
        </button>
      </div>

      <div v-if="!pendingFiles.length" class="upload-step">
        <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="fileInput?.click()" role="button"
          :aria-label="t('library.dragDropZone')" tabindex="0" @keydown.enter.prevent="fileInput?.click()"
          @keydown.space.prevent="fileInput?.click()">
          <input ref="fileInput" type="file"
            accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
            class="file-input" @change="handleFileSelect" aria-hidden="true" />
          <Icon name="upload" size="48" class="drop-zone-icon" />
          <div class="drop-zone-text">{{ t('library.dragDropZone') }}</div>
          <div class="drop-zone-formats">{{ t('library.acceptedFormats') }}</div>
        </div>
      </div>

      <div v-else class="preview-step">
        <div class="global-artist-section">
          <ArtistSelector v-model="globalArtistIds" :compact="true"
            :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
          <button type="button" class="btn-apply-to-all" @click="applyArtistsToAll" :disabled="!globalArtistIds.length">
            <Icon name="check" size="14" />
            {{ t('library.applyToAll') || 'Aplicar a todas' }}
          </button>
        </div>

        <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
        <div class="preview-list">
          <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
            <div class="preview-cover">
              <img v-if="file.cover" :src="file.cover" alt="" class="preview-cover-img" />
              <div v-else class="preview-cover-placeholder" aria-hidden="true">
                <Icon name="music" size="20" />
              </div>
            </div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
              <ArtistSelector v-model="file.artistIds" :compact="true"
                :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <input v-model="file.album" :placeholder="t('library.album')" class="preview-input" />
              <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')"
                :title="t('library.releaseDate')" class="preview-input" />
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" @click="removeFile(index)"
              :aria-label="'Eliminar ' + (file.title || file.fileName)">
              <Icon name="close" size="16" />
            </button>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="close">
            {{ t('library.cancel') }}
          </button>
          <button class="btn btn-primary" @click="upload" :disabled="uploading">
            {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}',
              String(pendingFiles.length)) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseBlob } from 'music-metadata-browser'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { formatDuration, formatFileSize } from '../../utils/utils'
import Icon from '../icons/Icon.vue'
import ArtistSelector from './ArtistSelector.vue'

interface PendingFile {
  file: File
  fileName: string
  title: string
  artistIds: number[]
  album: string
  duration: number
  cover: string | null
  coverFile: File | null
  releaseDate: string
}

const { t } = useI18n()

const props = defineProps({
  showUpload: { type: Boolean, required: true },
  embedded: { type: Boolean, default: false },
  editMode: { type: Boolean, default: false },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:showUpload', 'uploaded'])

const editTitle = ref('')
const editArtistIds = ref<number[]>([])
const editAlbum = ref('')
const editReleaseDate = ref('')
const editCover = ref<string | null>(null)
const editCoverFile = ref<File | null>(null)
const editing = ref(false)
const editCoverInput = ref<HTMLInputElement | null>(null)

watch(() => props.editData, (data: any) => {
  if (data && props.editMode) {
    editTitle.value = data.title || ''
    editArtistIds.value = data.artists ? data.artists.map((a: any) => a.id) : []
    editAlbum.value = data.album || ''
    editReleaseDate.value = data.releaseDate || ''
    editCover.value = data.cover || null
    editCoverFile.value = null
  }
}, { immediate: true })

const handleEditCoverSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    editCoverFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      editCover.value = reader.result as string | null
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

const closeEdit = () => {
  emit('update:showUpload', false)
  editing.value = false
}

const saveEdit = async () => {
  if (!editTitle.value.trim() || editing.value || !props.editData) return
  editing.value = true
  try {
    await api.updateTrack(
      props.editData.id,
      editTitle.value.trim(),
      editArtistIds.value,
      editAlbum.value || undefined,
      editReleaseDate.value || undefined,
      editCoverFile.value || undefined
    )
    closeEdit()
    emit('uploaded')
  } catch (e) {
    console.error(e)
  } finally {
    editing.value = false
  }
}

const isDragOver = ref(false)
const pendingFiles = ref<PendingFile[]>([])
const uploading = ref(false)
const storageError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const globalArtistIds = ref<number[]>([])

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  const CHUNK = 8192
  let result = ''
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK)
    result += String.fromCharCode(...chunk)
  }
  return btoa(result)
}

const ARTIST_DELIMITERS = /\s+(?:feat\.|ft\.|featuring|&)\s+|,\s*|\s+y\s+|\s+x\s+/i

const parseAndLookupArtists = async (artistString: string) => {
  if (!artistString || !artistString.trim()) return []

  const names = artistString.split(ARTIST_DELIMITERS).map(n => n.trim()).filter(Boolean)
  if (names.length === 0) return []

  const ids: number[] = []
  const seenIds = new Set<number>()

  for (const name of names) {
    try {
      const data = await api.getArtists(0, 20, name)
      const match = data.artists[0]

      if (match && !seenIds.has(match.id)) {
        ids.push(match.id)
        seenIds.add(match.id)
      }
    } catch (e) {
      console.error(`Error looking up artist "${name}":`, e)
    }
  }

  return ids
}

const processFiles = async (files: FileList) => {
  const validFiles = Array.from(files).filter(f => {
    const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase()
    return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(f.type)
  })

  for (const file of validFiles) {
    const metadata = await parseBlob(file)

    let coverDataUrl = null
    let coverFileObj = null
    if (metadata.common.picture?.[0]) {
      const pic = metadata.common.picture[0]
      const base64 = arrayBufferToBase64(pic.data.buffer)
      coverDataUrl = `data:${pic.format};base64,${base64}`
      coverFileObj = new File([pic.data], 'cover.jpg', { type: pic.format })
    }

    const artistIds = await parseAndLookupArtists(metadata.common.artist ?? '')

    pendingFiles.value.push({
      file,
      fileName: file.name,
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
      artistIds,
      album: metadata.common.album || '',
      duration: Math.round(metadata.format.duration ?? 0),
      cover: coverDataUrl,
      coverFile: coverFileObj,
      releaseDate: ''
    })
  }
}

const applyArtistsToAll = () => {
  if (!globalArtistIds.value.length) return
  pendingFiles.value.forEach(f => {
    f.artistIds = [...globalArtistIds.value]
  })
}

const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false
  await processFiles(e.dataTransfer!.files)
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    await processFiles(target.files)
    target.value = ''
  }
}

const removeFile = (index: number) => {
  pendingFiles.value.splice(index, 1)
}

const close = () => {
  emit('update:showUpload', false)
  pendingFiles.value = []
  isDragOver.value = false
  globalArtistIds.value = []
}

const upload = async () => {
  if (!pendingFiles.value.length || uploading.value) return
  uploading.value = true
  storageError.value = ''
  try {
    const totalNewSize = pendingFiles.value.reduce((sum, pf) => sum + (pf.file?.size || 0), 0)
    try {
      const storage = await api.getStorageUsage()
      if (storage.roleName !== 'ADMIN' && totalNewSize > storage.availableBytes) {
        storageError.value = t('library.storageError')
          .replace('{needed}', formatFileSize(totalNewSize))
          .replace('{available}', formatFileSize(storage.availableBytes))
        uploading.value = false
        return
      }
    } catch {
      // If storage check fails, proceed with upload (server will validate)
    }

    for (const pf of pendingFiles.value) {
      await api.uploadTrack(
        pf.title,
        pf.artistIds,
        pf.duration,
        pf.file,
        pf.album,
        undefined,
        pf.coverFile ?? undefined,
        pf.releaseDate
      )
    }
    close()
    emit('uploaded')
  } catch (e) {
    console.error(e)
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.global-artist-section {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.global-artist-section .artist-selector {
  flex: 1;
}

.btn-apply-to-all {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition);
  white-space: nowrap;
}

.btn-apply-to-all:hover:not(:disabled) {
  background: var(--accent-alpha);
  border-color: var(--accent);
  color: var(--accent);
}

.btn-apply-to-all:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.preview-row {
  gap: 12px;
  align-items: flex-start;
}

.edit-form {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.edit-cover {
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 64px;
  height: 64px;
}

.edit-cover-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.edit-cover-placeholder {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.edit-cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
  border-radius: var(--radius-sm);
  color: white;
}

.edit-cover:hover .edit-cover-overlay {
  opacity: 1;
}

.edit-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 768px) {
  .global-artist-section {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-apply-to-all {
    width: 100%;
    justify-content: center;
  }

  .drop-zone {
    padding: 24px 16px;
  }
}
</style>
