<template>
  <!-- Embedded mode: just the form content, no modal shell -->
  <template v-if="embedded">
    <div class="album-global-fields">
      <div class="album-cover-group" @click="$refs.coverInput.click()" :title="t('library.changeCover')">
        <img v-if="albumCover" :src="albumCover" alt="Cover" class="album-cover-img" />
        <div v-else class="album-cover-placeholder">&#127925;</div>
        <div class="album-cover-overlay">🖼</div>
        <input ref="coverInput" type="file" accept="image/*" class="file-input" @change="handleCoverSelect" />
      </div>
      <div class="album-meta-fields">
        <input v-model="albumName" :placeholder="t('library.albumName')" class="global-input" />
        <ArtistSelector v-model="selectedArtistIds" :compact="false" />
        <input v-model="albumReleaseDate" type="date" :placeholder="t('library.releaseDate')" class="global-input" />
      </div>
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
      <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
      <div class="preview-list" ref="sortableContainer">
          <div v-for="(file, index) in pendingFiles" :key="file._key" class="preview-row" :data-id="file._key">
            <div class="drag-handle" :title="t('library.dragToReorder')">⠿</div>
            <div class="preview-position">{{ file.position }}</div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
              <ArtistSelector v-model="file.artistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" @click="removeFile(file._key)"
              :title="t('library.removeFile')">&times;</button>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="upload" :disabled="uploading || !albumName.trim()">
            {{ uploading ? t('library.uploading') : t('library.uploadAlbumCount').replace('{count}',
              pendingFiles.length) }}
          </button>
        </div>
    </div>
  </template>

  <!-- Standalone mode: full modal with overlay -->
  <div v-else-if="showUpload" class="modal" @click.self="close">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.addAlbum') }}</h3>
        <button class="btn-close" @click="close">&times;</button>
      </div>

      <div class="album-global-fields">
        <div class="album-cover-group" @click="$refs.coverInput.click()" :title="t('library.changeCover')">
          <img v-if="albumCover" :src="albumCover" alt="Cover" class="album-cover-img" />
          <div v-else class="album-cover-placeholder">&#127925;</div>
          <div class="album-cover-overlay">🖼</div>
          <input ref="coverInput" type="file" accept="image/*" class="file-input" @change="handleCoverSelect" />
        </div>
        <div class="album-meta-fields">
          <input v-model="albumName" :placeholder="t('library.albumName')" class="global-input" />
          <ArtistSelector v-model="selectedArtistIds" :compact="false" />
          <input v-model="albumReleaseDate" type="date" :placeholder="t('library.releaseDate')" class="global-input" />
        </div>
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
        <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
        <div class="preview-list" ref="sortableContainer">
          <div v-for="(file, index) in pendingFiles" :key="file._key" class="preview-row" :data-id="file._key">
            <div class="drag-handle" :title="t('library.dragToReorder')">⠿</div>
            <div class="preview-position">{{ file.position }}</div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
              <ArtistSelector v-model="file.artistIds" :compact="true" :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" @click="removeFile(file._key)"
              :title="t('library.removeFile')">&times;</button>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="upload" :disabled="uploading || !albumName.trim()">
            {{ uploading ? t('library.uploading') : t('library.uploadAlbumCount').replace('{count}',
              pendingFiles.length) }}
          </button>
        </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { parseBlob } from 'music-metadata-browser'
import Sortable from 'sortablejs'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
const sortableContainer = ref(null)

const albumName = ref('')
const selectedArtistIds = ref([])
const albumCover = ref(null)
const albumCoverFile = ref(null)
const albumReleaseDate = ref('')

let sortableInstance = null
let keyCounter = 0

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']

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

const updatePositions = () => {
  pendingFiles.value.forEach((f, i) => {
    f.position = i + 1
  })
}

const processFiles = async (files) => {
  const validFiles = Array.from(files).filter(f => {
    const ext = '.' + f.name.split('.').pop().toLowerCase()
    return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(f.type)
  })

  for (const file of validFiles) {
    const metadata = await parseBlob(file)

    let coverDataUrl = null
    if (metadata.common.picture?.[0]) {
      const pic = metadata.common.picture[0]
      const base64 = arrayBufferToBase64(pic.data.buffer)
      coverDataUrl = `data:${pic.format};base64,${base64}`
      albumCoverFile.value = new File([pic.data], 'cover.jpg', { type: pic.format })
    }

    const wasEmpty = pendingFiles.value.length === 0

    const artistIds = await parseAndLookupArtists(metadata.common.artist)

    const fileArtistIds = artistIds.length > 0
      ? artistIds
      : (selectedArtistIds.value.length > 0 ? [...selectedArtistIds.value] : [])

    pendingFiles.value.push({
      _key: ++keyCounter,
      file,
      fileName: file.name,
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
      duration: Math.round(metadata.format.duration),
      position: pendingFiles.value.length + 1,
      artistIds: fileArtistIds
    })

    if (wasEmpty) {
      if (!albumName.value) albumName.value = metadata.common.album || ''
      if (!albumCover.value && coverDataUrl) albumCover.value = coverDataUrl
      if (artistIds.length > 0 && selectedArtistIds.value.length === 0) {
        selectedArtistIds.value = [...artistIds]
      }
    }
  }

  await nextTick()
  initSortable()
}

const handleCoverSelect = (e) => {
  const file = e.target.files?.[0]
  if (file) {
    albumCoverFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      albumCover.value = reader.result
    }
    reader.readAsDataURL(file)
  }
  e.target.value = ''
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

const removeFile = (key) => {
  const idx = pendingFiles.value.findIndex(f => f._key === key)
  if (idx !== -1) {
    pendingFiles.value.splice(idx, 1)
    updatePositions()
  }
}

const close = () => {
  emit('update:showUpload', false)
  pendingFiles.value = []
  isDragOver.value = false
  albumName.value = ''
  selectedArtistIds.value = []
  albumCover.value = null
  albumCoverFile.value = null
  albumReleaseDate.value = ''
  destroySortable()
}

const initSortable = () => {
  destroySortable()
  if (!sortableContainer.value || pendingFiles.value.length < 2) return
  sortableInstance = Sortable.create(sortableContainer.value, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: () => {
      const rows = sortableContainer.value.querySelectorAll('.preview-row')
      const reordered = []
      const idMap = {}
      rows.forEach(row => {
        const id = parseInt(row.dataset.id)
        const item = pendingFiles.value.find(f => f._key === id)
        if (item) reordered.push(item)
      })
      pendingFiles.value = reordered
      updatePositions()
    }
  })
}

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

const upload = async () => {
  if (!pendingFiles.value.length || uploading.value) return
  if (!albumName.value.trim()) return
  uploading.value = true
  try {
    const album = await api.createAlbum(
      albumName.value,
      selectedArtistIds.value,
      albumCoverFile.value,
      albumReleaseDate.value || null
    )

    for (const pf of pendingFiles.value) {
      const trackArtistIds = pf.artistIds && pf.artistIds.length > 0
        ? pf.artistIds
        : selectedArtistIds.value
      await api.uploadAlbumTrack(
        album.id,
        pf.title,
        trackArtistIds,
        pf.duration,
        pf.file,
        pf.position,
        albumReleaseDate.value || null
      )
    }
    close()
    emit('uploaded')
  } catch (e) {
    console.error(t('library.albumUploadError'), e)
  } finally {
    uploading.value = false
  }
}

watch(selectedArtistIds, (newIds) => {
  if (newIds.length > 0 && pendingFiles.value.length > 0) {
    pendingFiles.value.forEach(f => {
      if (!f.artistIds || f.artistIds.length === 0) {
        f.artistIds = [...newIds]
      }
    })
  }
})

watch(() => pendingFiles.value.length, (len) => {
  if (len > 1) {
    nextTick(initSortable)
  } else {
    destroySortable()
  }
})

onBeforeUnmount(() => {
  destroySortable()
})
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

.album-global-fields {
  display: flex;
  gap: 14px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.album-cover-group {
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.album-cover-img {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.album-cover-placeholder {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.album-cover-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 20px;
  border-radius: var(--radius-sm);
}

.album-cover-group:hover .album-cover-overlay {
  opacity: 1;
}

.album-meta-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.global-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

.global-input:focus {
  outline: 2px solid var(--accent);
  border-color: transparent;
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
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin-bottom: 10px;
  align-items: center;
}

.drag-handle {
  flex-shrink: 0;
  width: 24px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--text-secondary);
  font-size: 20px;
  user-select: none;
  border-radius: var(--radius-sm);
}

.drag-handle:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.drag-handle:active {
  cursor: grabbing;
}

.preview-position {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
}

.preview-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.preview-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
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
