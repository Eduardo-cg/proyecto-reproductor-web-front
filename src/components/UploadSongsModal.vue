<template>
  <!-- Embedded mode: just the form content, no modal shell -->
  <template v-if="embedded">
    <div v-if="!pendingFiles.length" class="upload-step">
      <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
        <input ref="fileInput" type="file"
          accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
          class="file-input" @change="handleFileSelect" />
        <div class="drop-zone-icon">&#127925;</div>
        <div class="drop-zone-text">{{ t('library.dragDropZone') }}</div>
        <div class="drop-zone-formats">{{ t('library.acceptedFormats') }}</div>
      </div>
    </div>

    <div v-else class="preview-step">
      <div class="global-artist-section">
        <ArtistSelector v-model="globalArtistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
        <button type="button" class="btn-apply-to-all" @click="applyArtistsToAll"
                :disabled="!globalArtistIds.length">
          {{ t('library.applyToAll') || 'Aplicar a todas' }}
        </button>
      </div>

      <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
      <div class="preview-list">
        <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
          <div class="preview-cover">
            <img v-if="file.cover" :src="file.cover" alt="Cover" class="preview-cover-img" />
            <div v-else class="preview-cover-placeholder">&#127925;</div>
          </div>
          <div class="preview-fields">
            <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
            <ArtistSelector v-model="file.artistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <input v-model="file.album" :placeholder="t('library.album')" class="preview-input" />
            <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')" class="preview-input" />
            <div class="preview-meta">
              <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
              <span class="meta-file">{{ file.fileName }}</span>
            </div>
          </div>
          <button class="btn-remove-file" @click="removeFile(index)" :title="t('library.removeFile')">&times;</button>
        </div>
      </div>
      <div class="preview-actions">
        <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
        <button class="btn btn-primary" @click="upload" :disabled="uploading">
          {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}', pendingFiles.length) }}
        </button>
      </div>
    </div>
  </template>

  <!-- Standalone mode: full modal with overlay -->
  <div v-else-if="showUpload" class="modal" @click.self="close">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.addTrack') }}</h3>
        <button class="btn-close" @click="close">&times;</button>
      </div>

      <div v-if="!pendingFiles.length" class="upload-step">
        <div class="drop-zone" :class="{ 'drop-zone-dragover': isDragOver }" @dragover.prevent="isDragOver = true"
          @dragleave.prevent="isDragOver = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
          <input ref="fileInput" type="file"
            accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a" multiple
            class="file-input" @change="handleFileSelect" />
          <div class="drop-zone-icon">&#127925;</div>
          <div class="drop-zone-text">{{ t('library.dragDropZone') }}</div>
          <div class="drop-zone-formats">{{ t('library.acceptedFormats') }}</div>
        </div>
      </div>

      <div v-else class="preview-step">
        <div class="global-artist-section">
          <ArtistSelector v-model="globalArtistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
          <button type="button" class="btn-apply-to-all" @click="applyArtistsToAll"
                  :disabled="!globalArtistIds.length">
            {{ t('library.applyToAll') || 'Aplicar a todas' }}
          </button>
        </div>

        <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
        <div class="preview-list">
          <div v-for="(file, index) in pendingFiles" :key="index" class="preview-row">
            <div class="preview-cover">
              <img v-if="file.cover" :src="file.cover" alt="Cover" class="preview-cover-img" />
              <div v-else class="preview-cover-placeholder">&#127925;</div>
            </div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
              <ArtistSelector v-model="file.artistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <input v-model="file.album" :placeholder="t('library.album')" class="preview-input" />
              <input v-model="file.releaseDate" type="date" :placeholder="t('library.releaseDate')" class="preview-input" />
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" @click="removeFile(index)" :title="t('library.removeFile')">&times;</button>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="upload" :disabled="uploading">
            {{ uploading ? t('library.uploading') : t('library.uploadCount').replace('{count}', pendingFiles.length) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { parseBlob } from 'music-metadata-browser'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../services/api'
import { formatDuration } from '../utils/format'
import ArtistSelector from './ArtistSelector.vue'

const { t } = useI18n()

const props = defineProps({
  showUpload: { type: Boolean, required: true },
  embedded: { type: Boolean, default: false }
})

const emit = defineEmits(['update:showUpload', 'uploaded'])

const isDragOver = ref(false)
const pendingFiles = ref([])
const uploading = ref(false)
const fileInput = ref(null)
const globalArtistIds = ref([])

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']

const arrayBufferToBase64 = (buffer) => {
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

const parseAndLookupArtists = async (artistString) => {
  if (!artistString || !artistString.trim()) return []

  const names = artistString.split(ARTIST_DELIMITERS).map(n => n.trim()).filter(Boolean)
  if (names.length === 0) return []

  const ids = []
  const seenIds = new Set()

  for (const name of names) {
    try {
      const artists = await api.getArtists(name)
      const match = artists.find(
        a => a.name.toLowerCase() === name.toLowerCase()
      )
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

const processFiles = async (files) => {
  const validFiles = Array.from(files).filter(f => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
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

    const artistIds = await parseAndLookupArtists(metadata.common.artist)

    pendingFiles.value.push({
      file,
      fileName: file.name,
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
      artistIds,
      album: metadata.common.album || '',
      duration: Math.round(metadata.format.duration),
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

const handleDrop = async (e) => {
  isDragOver.value = false
  await processFiles(e.dataTransfer.files)
}

const handleFileSelect = async (e) => {
  if (e.target.files) {
    await processFiles(e.target.files)
    e.target.value = ''
  }
}

const removeFile = (index) => {
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
  try {
    for (const pf of pendingFiles.value) {
      await api.uploadTrack(
        pf.title,
        pf.artistIds,
        pf.duration,
        pf.file,
        pf.album,
        null,
        pf.coverFile,
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

.global-artist-section {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}

.global-artist-section .artist-selector {
  flex: 1;
}

.btn-apply-to-all {
  padding: 10px 16px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-apply-to-all:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.btn-apply-to-all:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.drop-zone {
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  padding: 50px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-zone:hover,
.drop-zone-dragover {
  border-color: var(--accent);
  background: rgba(29, 185, 84, 0.05);
}

.drop-zone-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-zone-text {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.drop-zone-formats {
  font-size: 13px;
  color: var(--text-secondary);
}

.file-input {
  display: none;
}

.preview-title {
  margin-bottom: 16px;
  font-size: 16px;
  color: var(--text-secondary);
}

.preview-list {
  max-height: 520px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.preview-row {
  display: flex;
  gap: 15px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  align-items: flex-start;
}

.preview-cover {
  flex-shrink: 0;
}

.preview-cover-img {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.preview-cover-placeholder {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.preview-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.preview-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}

.preview-input:focus {
  outline: 2px solid var(--accent);
  border-color: transparent;
}

.preview-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: var(--text-secondary);
}

.meta-duration {
  font-variant-numeric: tabular-nums;
}

.meta-file {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-remove-file {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 20px;
  cursor: pointer;
  border-radius: var(--radius-sm);
}

.btn-remove-file:hover {
  background: #e74c3c;
  color: white;
}

.preview-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.preview-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
