<template>
  <template v-if="showUpload && editMode && editData">
    <div class="modal" @click.self="closeEdit" role="dialog" aria-modal="true" aria-label="Editar álbum">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>{{ t('common.edit') + ': ' + editData.title }}</h3>
          <button class="btn-close" @click="closeEdit" aria-label="Cerrar">
            <Icon name="close" size="20" />
          </button>
        </div>
        <div class="album-global-fields">
          <div class="album-cover-group" @click="editCoverInput?.click()" :title="t('library.changeCover')"
            role="button" tabindex="0">
            <img v-if="editCover" :src="editCover" alt="" class="album-cover-img" />
            <div v-else class="album-cover-placeholder" aria-hidden="true">
              <Icon name="album" size="24" />
            </div>
            <div class="album-cover-overlay" aria-hidden="true">
              <Icon name="upload" size="20" />
            </div>
            <input ref="editCoverInput" type="file" accept="image/*" class="file-input"
              @change="handleEditCoverSelect" />
          </div>
          <div class="album-meta-fields">
            <input v-model="editAlbumName" :placeholder="t('library.albumName')" class="global-input" />
            <ArtistSelector v-model="editArtistIds" :compact="false" />
            <input v-model="editReleaseDate" type="date" :placeholder="t('library.releaseDate')"
              :title="t('library.releaseDate')" class="global-input" />
          </div>
        </div>
        <div v-if="editTracks.length" class="preview-step">
          <h4 class="preview-title">{{ t('library.tracks') }} ({{ editTracks.length }})</h4>
          <div class="preview-list" ref="editSortableContainer">
            <div v-for="(track, index) in editTracks" :key="track._key" class="preview-row" :data-id="track._key">
              <span class="drag-handle" :title="t('library.dragToReorder')" aria-hidden="true">
                <Icon name="drag" size="16" />
              </span>
              <div class="preview-position">{{ index + 1 }}</div>
              <div class="preview-fields">
                <input v-model="track.title" :placeholder="t('library.trackTitle')" class="preview-input" />
                <ArtistSelector v-model="track.artistIds" :compact="true"
                  :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
                <div class="preview-meta">
                  <span class="meta-duration">{{ track.duration ? formatDuration(track.duration) : '--:--' }}</span>
                  <span v-if="track._isNew && track.file" class="meta-size">{{ formatFileSize(track.file?.size)
                  }}</span>
                  <span v-if="track._isNew" class="meta-file">({{ t('library.new') }})</span>
                </div>
              </div>
              <button class="btn-remove-file" @click="removeEditTrack(track._key)"
                :aria-label="'Eliminar ' + (track.title || 'canción')">
                <Icon name="close" size="16" />
              </button>
            </div>
          </div>
        </div>
        <div class="add-tracks-area">
          <div class="drop-zone add-zone" @click="editFileInput?.click()" role="button" tabindex="0"
            @keydown.enter.prevent="editFileInput?.click()" @keydown.space.prevent="editFileInput?.click()">
            <Icon name="plus" size="24" class="add-zone-icon" />
            <span class="add-zone-text">{{ t('library.addTracks') }}</span>
            <input ref="editFileInput" type="file"
              accept=".mp3,.wav,.ogg,.flac,.m4a,audio/mpeg,audio/wav,audio/ogg,audio/flac,audio/mp4,audio/x-m4a"
              multiple class="file-input" @change="handleEditAddFiles" aria-hidden="true" />
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="closeEdit">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="saveEdit" :disabled="editing || !editAlbumName.trim()">
            {{ editing ? t('common.saving') : t('common.save') }}
          </button>
        </div>
      </div>
    </div>
  </template>

  <template v-else-if="embedded">
    <div class="album-global-fields">
      <div class="album-cover-group" @click="coverInput?.click()" :title="t('library.changeCover')" role="button"
        tabindex="0" :aria-label="'Seleccionar portada'">
        <img v-if="albumCover" :src="albumCover" alt="Portada del álbum" class="album-cover-img" />
        <div v-else class="album-cover-placeholder" aria-hidden="true">
          <Icon name="album" size="24" />
        </div>
        <div class="album-cover-overlay" aria-hidden="true">
          <Icon name="upload" size="20" />
        </div>
        <input ref="coverInput" type="file" accept="image/*" class="file-input" @change="handleCoverSelect" />
      </div>
      <div class="album-meta-fields">
        <input v-model="albumName" :placeholder="t('library.albumName')" class="global-input" />
        <ArtistSelector v-model="selectedArtistIds" :compact="false" />
        <input v-model="albumReleaseDate" type="date" :placeholder="t('library.releaseDate')"
          :title="t('library.releaseDate')" class="global-input" />
      </div>
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
      <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
      <div class="preview-list" ref="sortableContainer">
        <div v-for="(file, index) in pendingFiles" :key="file._key" class="preview-row" :data-id="file._key">
          <span class="drag-handle" :title="t('library.dragToReorder')" aria-hidden="true">
            <Icon name="drag" size="16" />
          </span>
          <div class="preview-position">{{ file.position }}</div>
          <div class="preview-fields">
            <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
            <ArtistSelector v-model="file.artistIds" :compact="true"
              :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
            <div class="preview-meta">
              <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
              <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
              <span class="meta-file">{{ file.fileName }}</span>
            </div>
          </div>
          <button class="btn-remove-file" @click="removeFile(file._key)"
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
        <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
        <button class="btn btn-primary" @click="upload" :disabled="uploading || !albumName.trim()">
          {{ uploading ? t('library.uploading') : t('library.uploadAlbumCount').replace('{count}',
            String(pendingFiles.length))
          }}
        </button>
      </div>
    </div>
  </template>

  <div v-else-if="showUpload" class="modal" @click.self="close" role="dialog" aria-modal="true"
    aria-label="Subir álbum">
    <div class="modal-content modal-large">
      <div class="modal-header">
        <h3>{{ t('library.addAlbum') }}</h3>
        <button class="btn-close" @click="close" aria-label="Cerrar">
          <Icon name="close" size="20" />
        </button>
      </div>

      <div class="album-global-fields">
        <div class="album-cover-group" @click="coverInput?.click()" :title="t('library.changeCover')" role="button"
          tabindex="0" :aria-label="'Seleccionar portada'">
          <img v-if="albumCover" :src="albumCover" alt="Portada del álbum" class="album-cover-img" />
          <div v-else class="album-cover-placeholder" aria-hidden="true">
            <Icon name="album" size="24" />
          </div>
          <div class="album-cover-overlay" aria-hidden="true">
            <Icon name="upload" size="20" />
          </div>
          <input ref="coverInput" type="file" accept="image/*" class="file-input" @change="handleCoverSelect" />
        </div>
        <div class="album-meta-fields">
          <input v-model="albumName" :placeholder="t('library.albumName')" class="global-input" />
          <ArtistSelector v-model="selectedArtistIds" :compact="false" />
          <input v-model="albumReleaseDate" type="date" :placeholder="t('library.releaseDate')"
            :title="t('library.releaseDate')" class="global-input" />
        </div>
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
        <h4 class="preview-title">{{ t('library.previewTitle') }} ({{ pendingFiles.length }})</h4>
        <div class="preview-list" ref="sortableContainer">
          <div v-for="(file, index) in pendingFiles" :key="file._key" class="preview-row" :data-id="file._key">
            <span class="drag-handle" :title="t('library.dragToReorder')" aria-hidden="true">
              <Icon name="drag" size="16" />
            </span>
            <div class="preview-position">{{ file.position }}</div>
            <div class="preview-fields">
              <input v-model="file.title" :placeholder="t('library.trackTitle')" class="preview-input" />
              <ArtistSelector v-model="file.artistIds" :compact="true"
                :placeholder="t('library.selectArtist') + ' (' + t('library.trackArtists') + ')'" />
              <div class="preview-meta">
                <span class="meta-duration">{{ file.duration ? formatDuration(file.duration) : '--:--' }}</span>
                <span class="meta-size">{{ formatFileSize(file.file?.size) }}</span>
                <span class="meta-file">{{ file.fileName }}</span>
              </div>
            </div>
            <button class="btn-remove-file" @click="removeFile(file._key)"
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
          <button class="btn btn-secondary" @click="close">{{ t('library.cancel') }}</button>
          <button class="btn btn-primary" @click="upload" :disabled="uploading || !albumName.trim()">
            {{ uploading ? t('library.uploading') : t('library.uploadAlbumCount').replace('{count}',
              String(pendingFiles.length))
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { parseBlob } from 'music-metadata-browser'
import Sortable from 'sortablejs'
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { formatDuration, formatFileSize } from '../../utils/utils'
import Icon from '../icons/Icon.vue'
import ArtistSelector from './ArtistSelector.vue'

interface PendingFile {
  _key: number
  file?: File
  fileName?: string
  title: string
  duration: number
  artistIds: number[]
  cover?: string | null
  coverFile?: File | null
  releaseDate?: string
  position?: number
  _isNew: boolean
  _trackId: number | null
}

const { t } = useI18n()

const props = defineProps({
  showUpload: { type: Boolean, required: true },
  embedded: { type: Boolean, default: false },
  editMode: { type: Boolean, default: false },
  editData: { type: Object, default: null }
})

const emit = defineEmits(['update:showUpload', 'uploaded'])

const editCoverInput = ref<HTMLInputElement | null>(null)
const editFileInput = ref<HTMLInputElement | null>(null)
const coverInput = ref<HTMLInputElement | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const editAlbumName = ref('')
const editArtistIds = ref<number[]>([])
const editReleaseDate = ref('')
const editCover = ref<string | null>(null)
const editCoverFile = ref<File | null>(null)
const editing = ref(false)
const editTracks = ref<PendingFile[]>([])
const editRemovedTrackIds = ref<number[]>([])
const editSortableContainer = ref<HTMLElement | null>(null)
let editSortableInstance: Sortable | null = null

watch(() => props.editData, (data: any) => {
  if (data && props.editMode) {
    editAlbumName.value = data.title || ''
    editArtistIds.value = data.artists ? data.artists.map((a: any) => a.id) : []
    editReleaseDate.value = data.releaseDate || ''
    editCover.value = data.cover || null
    editCoverFile.value = null
    editRemovedTrackIds.value = []
    if (data.tracks) {
      editTracks.value = data.tracks.map((t: any) => ({
        _key: ++keyCounter,
        _trackId: t.id,
        _isNew: false,
        title: t.title,
        artistIds: t.artists ? t.artists.map((a: any) => a.id) : [],
        duration: t.duration
      }))
    } else {
      editTracks.value = []
    }
    nextTick(initEditSortable)
  }
}, { immediate: true })

const handleEditCoverSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    editCoverFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      editCover.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

const closeEdit = () => {
  destroyEditSortable()
  emit('update:showUpload', false)
  editing.value = false
}

const saveEdit = async () => {
  if (!editAlbumName.value.trim() || editing.value || !props.editData) return
  editing.value = true
  const albumId = props.editData.id
  try {
    await api.updateAlbum(
      albumId,
      editAlbumName.value.trim(),
      editArtistIds.value,
      editReleaseDate.value || undefined,
      editCoverFile.value || undefined
    )

    for (const trackId of editRemovedTrackIds.value) {
      try {
        await api.deleteAlbumTrack(albumId, trackId)
      } catch (e) {
        console.error('Error removing track', trackId, e)
      }
    }

    for (const track of editTracks.value) {
      if (!track._isNew) {
        const orig = props.editData.tracks ? props.editData.tracks.find((t: any) => t.id === track._trackId) : null
        const origArtistIds = orig && orig.artists ? orig.artists.map((a: any) => a.id) : []
        const changed = orig && (orig.title !== track.title ||
          JSON.stringify(origArtistIds) !== JSON.stringify(track.artistIds))
        if (changed) {
          await api.updateTrack(track._trackId!, track.title, track.artistIds, editAlbumName.value.trim(), undefined)
        }
      }
    }

    for (const track of editTracks.value) {
      if (!track._isNew) continue
      const trackArtistIds = track.artistIds && track.artistIds.length > 0
        ? track.artistIds
        : editArtistIds.value
      const created = await api.uploadAlbumTrack(
        albumId,
        track.title,
        trackArtistIds,
        track.duration,
        track.file!,
        editTracks.value.indexOf(track) + 1,
        editReleaseDate.value || undefined
      )
      track._trackId = created.id
    }

    const orderedIds = editTracks.value.map(t => t._trackId).filter((x): x is number => x !== null)
    if (orderedIds.length > 0) {
      await api.reorderAlbumTracks(albumId, orderedIds)
    }

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
const sortableContainer = ref<HTMLElement | null>(null)

const albumName = ref('')
const selectedArtistIds = ref<number[]>([])
const albumCover = ref<string | null>(null)
const albumCoverFile = ref<File | null>(null)
const albumReleaseDate = ref('')

let sortableInstance: Sortable | null = null
let keyCounter = 0

const ACCEPTED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac', 'audio/mp4', 'audio/x-m4a', 'audio/aac']
const ACCEPTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.m4a']

const ARTIST_DELIMITERS = /\s+(?:feat\.|ft\.|featuring|&)\s+|,\s*|\s+y\s+|\s+x\s+/i

const parseAndLookupArtists = async (artistString: string) => {
  if (!artistString || !artistString.trim()) return []

  const names = artistString.split(ARTIST_DELIMITERS).map((n: string) => n.trim()).filter(Boolean)
  if (names.length === 0) return []

  const ids = []
  const seenIds = new Set()

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

const updatePositions = () => {
  pendingFiles.value.forEach((f: PendingFile, i: number) => {
    f.position = i + 1
  })
}

const processFiles = async (files: FileList | null) => {
  if (!files) return
  const validFiles = Array.from(files).filter((f: File) => {
    const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase()
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

    const artistIds = await parseAndLookupArtists(metadata.common.artist ?? '')

    const fileArtistIds = artistIds.length > 0
      ? artistIds
      : (selectedArtistIds.value.length > 0 ? [...selectedArtistIds.value] : [])

    pendingFiles.value.push({
      _key: ++keyCounter,
      _trackId: null,
      _isNew: true,
      file,
      fileName: file.name,
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
      duration: Math.round(metadata.format.duration ?? 0),
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

const handleCoverSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    albumCoverFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      albumCover.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
  target.value = ''
}

const handleDrop = async (e: DragEvent) => {
  isDragOver.value = false
  if (e.dataTransfer) {
    await processFiles(e.dataTransfer.files)
  }
}

const handleFileSelect = async (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    await processFiles(target.files)
    target.value = ''
  }
}

const removeFile = (key: number) => {
  const idx = pendingFiles.value.findIndex((f: PendingFile) => f._key === key)
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
    scroll: true,
    scrollSensitivity: 50,
    scrollSpeed: 10,
    bubbleScroll: true,
    onEnd: () => {
      const rows = sortableContainer.value!.querySelectorAll('.preview-row')
      const reordered: PendingFile[] = []
      const idMap: Record<string, number> = {}
      rows.forEach((row: Element) => {
        const id = parseInt((row as HTMLElement).dataset.id!)
        const item = pendingFiles.value.find((f: PendingFile) => f._key === id)
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

const handleEditAddFiles = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files) return
  const validFiles = Array.from(files).filter((f: File) => {
    const ext = '.' + (f.name.split('.').pop() ?? '').toLowerCase()
    return ACCEPTED_EXTENSIONS.includes(ext) || ACCEPTED_TYPES.includes(f.type)
  })
  for (const file of validFiles) {
    const metadata = await parseBlob(file)
    const artistIds = await parseAndLookupArtists(metadata.common.artist ?? '')
    editTracks.value.push({
      _key: ++keyCounter,
      _trackId: null,
      _isNew: true,
      file,
      title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
      artistIds: artistIds.length > 0 ? artistIds : (editArtistIds.value.length > 0 ? [...editArtistIds.value] : []),
      duration: Math.round(metadata.format.duration ?? 0) || 0
    })
  }
  target.value = ''
  await nextTick()
  initEditSortable()
}

const removeEditTrack = (key: number) => {
  const idx = editTracks.value.findIndex((t: PendingFile) => t._key === key)
  if (idx === -1) return
  const track = editTracks.value[idx]
  if (!track._isNew && track._trackId) {
    editRemovedTrackIds.value.push(track._trackId)
  }
  editTracks.value.splice(idx, 1)
  if (editTracks.value.length < 2) {
    destroyEditSortable()
  }
}

const initEditSortable = () => {
  destroyEditSortable()
  if (!editSortableContainer.value || editTracks.value.length < 2) return
  editSortableInstance = Sortable.create(editSortableContainer.value, {
    handle: '.drag-handle',
    animation: 150,
    scroll: true,
    scrollSensitivity: 50,
    scrollSpeed: 10,
    bubbleScroll: true,
    onEnd: () => {
      const rows = editSortableContainer.value!.querySelectorAll('.preview-row')
      const reordered: PendingFile[] = []
      rows.forEach((row: Element) => {
        const id = parseInt((row as HTMLElement).dataset.id!)
        const item = editTracks.value.find((t: PendingFile) => t._key === id)
        if (item) reordered.push(item)
      })
      editTracks.value = reordered
    }
  })
}

const destroyEditSortable = () => {
  if (editSortableInstance) {
    editSortableInstance.destroy()
    editSortableInstance = null
  }
}

const upload = async () => {
  if (!pendingFiles.value.length || uploading.value) return
  if (!albumName.value.trim()) return
  uploading.value = true
  storageError.value = ''
  try {
    const totalNewSize = pendingFiles.value.reduce((sum: number, pf: PendingFile) => sum + (pf.file?.size || 0), 0)
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

    const album = await api.createAlbum(
      albumName.value,
      selectedArtistIds.value,
      albumCoverFile.value ?? undefined,
      albumReleaseDate.value || undefined
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
        pf.file!,
        pf.position,
        albumReleaseDate.value || undefined
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

watch(selectedArtistIds, (newIds: number[]) => {
  if (newIds.length > 0 && pendingFiles.value.length > 0) {
    pendingFiles.value.forEach((f: PendingFile) => {
      if (!f.artistIds || f.artistIds.length === 0) {
        f.artistIds = [...newIds]
      }
    })
  }
})

watch(() => pendingFiles.value.length, (len: number) => {
  if (len > 1) {
    nextTick(initSortable)
  } else {
    destroySortable()
  }
})

onBeforeUnmount(() => {
  destroySortable()
  destroyEditSortable()
})
</script>

<style scoped>
.album-global-fields {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
}

.album-cover-group {
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: 64px;
  height: 64px;
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
  color: var(--text-muted);
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
  border-radius: var(--radius-sm);
  color: white;
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
  padding: 8px 10px;
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

.preview-row {
  gap: 10px;
  align-items: center;
}

.add-tracks-area {
  margin-bottom: 16px;
}

.add-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  cursor: pointer;
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition), background var(--transition);
}

.add-zone:hover {
  border-color: var(--accent);
  background: var(--accent-alpha);
}

.add-zone-icon {
  color: var(--text-muted);
}

.add-zone-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .album-global-fields {
    flex-direction: column;
    align-items: center;
  }

  .album-meta-fields {
    width: 100%;
  }

  .drop-zone {
    padding: 24px 16px;
  }
}
</style>
