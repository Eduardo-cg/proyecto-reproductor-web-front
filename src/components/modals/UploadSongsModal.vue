<template>
  <template v-if="showUpload && editMode && editData">
    <div class="modal" role="dialog" aria-modal="true" aria-label="Editar canción" @click.self="closeEdit">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>{{ t('common.edit') + ': ' + editData.title }}</h3>
          <button class="btn-close" aria-label="Cerrar" @click="closeEdit">
            <Icon name="close" size="20" />
          </button>
        </div>
        <div class="edit-form">
          <div class="edit-cover" :title="t('library.changeCover')" role="button" tabindex="0"
            @click="editCoverInput?.click()">
            <img v-if="editCover" :src="editCover" alt="" class="edit-cover-img">
            <div v-else class="edit-cover-placeholder" aria-hidden="true">
              <Icon name="music" size="24" />
            </div>
            <div class="edit-cover-overlay" aria-hidden="true">
              <Icon name="upload" size="20" />
            </div>
            <input ref="editCoverInput" type="file" accept="image/*" class="file-input" @change="handleEditCoverSelect">
          </div>
          <div class="edit-fields">
            <input v-model="editTitle" :placeholder="t('library.trackTitle')" class="preview-input">
            <ArtistSelector v-model="editArtistIds" :compact="false"
              :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <input v-model="editAlbum" :placeholder="t('library.album')" class="preview-input">
            <input v-model="editReleaseDate" type="date" :placeholder="t('library.releaseDate')"
              :title="t('library.releaseDate')" class="preview-input">
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="closeEdit">
            {{ t('library.cancel') }}
          </button>
          <button class="btn btn-primary" :disabled="editing || !editTitle.trim()" @click="saveEdit">
            {{ editing ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </template>

  <template v-else-if="embedded">
    <div v-if="!pendingFiles.length" class="upload-step">
      <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" role="button"
        :aria-label="t('library.dragDropZone')" tabindex="0" @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="fileInput?.click()"
        @keydown.enter.prevent="fileInput?.click()" @keydown.space.prevent="fileInput?.click()">
        <input ref="fileInput" type="file"
          accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
          class="file-input" aria-hidden="true" @change="handleFileSelect">
        <Icon name="upload" size="48" class="drop-zone-icon" />
        <div class="drop-zone-text">
          {{ t('library.dragDropZone') }}
        </div>
        <div class="drop-zone-formats">
          {{ t('library.acceptedFormats') }}
        </div>
      </div>
    </div>

    <div v-else class="preview-step">
      <div class="global-artist-section">
        <ArtistSelector v-model="globalArtistIds" :compact="true"
          :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
        <button type="button" class="btn-apply-to-all" :disabled="!globalArtistIds.length" @click="applyArtistsToAll">
          <Icon name="check" size="14" />
          {{ t('library.applyToAll') || 'Aplicar a todas' }}
        </button>
      </div>

      <h4 class="preview-title">
        {{ t('library.previewTitle') }} ({{ pendingFiles.length }})
      </h4>
      <div class="preview-list">
        <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
          <div class="preview-cover" role="button" tabindex="0"
            :title="t('library.changeCover')" :aria-label="t('library.changeCover')"
            @click="triggerCoverInput(index)" @keydown.enter.prevent="triggerCoverInput(index)"
            @keydown.space.prevent="triggerCoverInput(index)">
            <img v-if="file.cover" :src="file.cover" alt="" class="preview-cover-img">
            <div v-else class="preview-cover-placeholder" aria-hidden="true">
              <Icon name="music" size="20" />
            </div>
            <div class="preview-cover-overlay" aria-hidden="true">
              <Icon name="upload" size="16" />
            </div>
          </div>
          <div class="preview-fields">
            <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input">
            <ArtistSelector v-model="file.artistIds" :compact="true"
              :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <input v-model="file.album" :placeholder="t('library.album')" class="preview-input">
            <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')"
              :title="t('library.releaseDate')" class="preview-input">
            <div class="preview-meta">
              <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
              <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
              <span class="meta-file">{{ file.fileName }}</span>
            </div>
          </div>
          <button class="btn-remove-file" :aria-label="'Eliminar ' + (file.title || file.fileName)"
            @click="removeFile(index)">
            <Icon name="close" size="16" />
          </button>
        </div>
      </div>
      <input ref="coverInput" type="file" accept="image/*" class="file-input"
        @change="handlePreviewCoverSelect">
      <div v-if="storageError" class="storage-error">
        <Icon name="close" size="16" />
        {{ storageError }}
      </div>
      <div class="preview-actions">
        <button class="btn btn-secondary" @click="close">
          {{ t('library.cancel') }}
        </button>
        <button class="btn btn-primary" :disabled="uploading" @click="upload">
          {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}',
            String(pendingFiles.length)) }}
        </button>
      </div>
    </div>
  </template>

  <div v-else-if="showUpload" class="modal" role="dialog" aria-modal="true" aria-label="Subir canciones"
    @click.self="close">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.addTrack') }}</h3>
        <button class="btn-close" aria-label="Cerrar" @click="close">
          <Icon name="close" size="20" />
        </button>
      </div>

      <div v-if="!pendingFiles.length" class="upload-step">
        <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" role="button"
          :aria-label="t('library.dragDropZone')" tabindex="0" @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="fileInput?.click()"
          @keydown.enter.prevent="fileInput?.click()" @keydown.space.prevent="fileInput?.click()">
          <input ref="fileInput" type="file"
            accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
            class="file-input" aria-hidden="true" @change="handleFileSelect">
          <Icon name="upload" size="48" class="drop-zone-icon" />
          <div class="drop-zone-text">
            {{ t('library.dragDropZone') }}
          </div>
          <div class="drop-zone-formats">
            {{ t('library.acceptedFormats') }}
          </div>
        </div>
      </div>

      <div v-else class="preview-step">
        <div class="global-artist-section">
          <ArtistSelector v-model="globalArtistIds" :compact="true"
            :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
          <button type="button" class="btn-apply-to-all" :disabled="!globalArtistIds.length" @click="applyArtistsToAll">
            <Icon name="check" size="14" />
            {{ t('library.applyToAll') || 'Aplicar a todas' }}
          </button>
        </div>

        <h4 class="preview-title">
          {{ t('library.previewTitle') }} ({{ pendingFiles.length }})
        </h4>
        <div class="preview-list">
          <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
            <div class="preview-cover" role="button" tabindex="0"
              :title="t('library.changeCover')" :aria-label="t('library.changeCover')"
              @click="triggerCoverInput(index)" @keydown.enter.prevent="triggerCoverInput(index)"
              @keydown.space.prevent="triggerCoverInput(index)">
              <img v-if="file.cover" :src="file.cover" alt="" class="preview-cover-img">
              <div v-else class="preview-cover-placeholder" aria-hidden="true">
                <Icon name="music" size="20" />
              </div>
              <div class="preview-cover-overlay" aria-hidden="true">
                <Icon name="upload" size="16" />
              </div>
            </div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input">
              <ArtistSelector v-model="file.artistIds" :compact="true"
                :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <input v-model="file.album" :placeholder="t('library.album')" class="preview-input">
              <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')"
                :title="t('library.releaseDate')" class="preview-input">
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" :aria-label="'Eliminar ' + (file.title || file.fileName)"
              @click="removeFile(index)">
              <Icon name="close" size="16" />
            </button>
          </div>
        </div>
        <input ref="coverInput" type="file" accept="image/*" class="file-input"
          @change="handlePreviewCoverSelect">
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="close">
            {{ t('library.cancel') }}
          </button>
          <button class="btn btn-primary" :disabled="uploading" @click="upload">
            {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}',
              String(pendingFiles.length)) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseBlob } from 'music-metadata'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import type { ArtistDTO, TrackDTO } from '../../types'
import { extractCover, formatDuration, formatFileSize, titleFromFile } from '../../utils/utils'
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

const props = withDefaults(
  defineProps<{
    embedded?: boolean
    editMode?: boolean
    editData?: TrackDTO | null
  }>(),
  {
    embedded: false,
    editMode: false,
    editData: null
  }
)

const showUpload = defineModel<boolean>('showUpload', { required: true })

const emit = defineEmits(['uploaded'])

const editTitle = ref('')
const editArtistIds = ref<number[]>([])
const editAlbum = ref('')
const editReleaseDate = ref('')
const editCover = ref<string | null>(null)
const editCoverFile = ref<File | null>(null)
const editing = ref(false)
const editCoverInput = ref<HTMLInputElement | null>(null)

watch(() => props.editData, (data: TrackDTO | null) => {
  if (data && props.editMode) {
    editTitle.value = data.title || ''
    editArtistIds.value = data.artists ? data.artists.map((a: ArtistDTO) => a.id) : []
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
  showUpload.value = false
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
const coverInput = ref<HTMLInputElement | null>(null)
const activeCoverIndex = ref<number | null>(null)
const globalArtistIds = ref<number[]>([])

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']

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
    const cover = extractCover(metadata)
    const artistIds = await parseAndLookupArtists(metadata.common.artist || '')

    pendingFiles.value.push({
      file,
      fileName: file.name,
      title: titleFromFile(file, metadata.common.title),
      artistIds,
      album: metadata.common.album || '',
      duration: Math.round(metadata.format.duration ?? 0),
      cover: cover?.dataUrl ?? null,
      coverFile: cover?.file ?? null,
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

const triggerCoverInput = (index: number) => {
  activeCoverIndex.value = index
  coverInput.value?.click()
}

const handlePreviewCoverSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  const idx = activeCoverIndex.value
  if (file && idx !== null) {
    const pf = pendingFiles.value[idx]
    if (pf) {
      pf.coverFile = file
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          pf.cover = reader.result as string
        }
      }
      reader.readAsDataURL(file)
    }
  }
  target.value = ''
  activeCoverIndex.value = null
}

const removeFile = (index: number) => {
  pendingFiles.value.splice(index, 1)
}

const close = () => {
  showUpload.value = false
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
  align-items: center;
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
  min-height: 40px;
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

.preview-cover {
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 48px;
  height: 48px;
}

.preview-cover-overlay {
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
  pointer-events: none;
}

.preview-cover:hover .preview-cover-overlay,
.preview-cover:focus-visible .preview-cover-overlay {
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
