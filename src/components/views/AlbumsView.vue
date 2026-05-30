<template>
  <div>
    <div class="toolbar">
      <div class="search" role="search">
        <div class="search-wrapper">
          <Icon name="search" size="16" class="search-icon" />
          <input v-model="search" type="text" :placeholder="t('library.albumSearchPlaceholder')"
            aria-label="Buscar álbumes" @keyup.enter="handleSearch" />
        </div>
      </div>
      <CombinedFilter
        v-model:artistIds="selectedArtistIds"
        v-model:sortBy="sortBy"
        v-model:sortDirection="sortDirection"
        :showAlbums="false"
        :sortOptions="albumSortOptions"
      />
      <div class="toolbar-actions">
        <button class="btn btn-primary" @click="handleSearch">
          <Icon name="search" size="14" />
          {{ t('library.search') }}
        </button>
        <button class="btn btn-secondary" @click="clearFilters">
          {{ t('library.clearFilters') }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading" role="status">{{ t('auth.loading') }}</div>

    <template v-else>
      <div v-if="albums.length === 0" class="empty">
        <Icon name="empty" size="48" />
        <p>{{ t('library.noAlbums') }}</p>
      </div>
      <div v-else class="tracks-table" role="table" aria-label="Lista de álbumes">
        <div class="tracks-header albums-header" role="row">
          <div class="col-cover" role="columnheader"></div>
          <div class="col-title" role="columnheader">{{ t('library.albumName') }}</div>
          <div class="col-artist" role="columnheader">{{ t('library.trackArtist') }}</div>
          <div class="col-duration" role="columnheader">{{ t('library.albumCount').replace('{count}', '') }}</div>
          <div class="col-actions" role="columnheader"></div>
        </div>
        <div v-for="album in albums" :key="album.id" class="track-wrapper">
          <div class="track-row album-row" @click="toggleAlbum(album.id)" role="row"
            :aria-expanded="expandedAlbumId === album.id">
            <div class="col-cover" role="cell">
              <img v-if="album.cover" :src="album.cover" alt="" class="track-cover" />
              <div v-else class="cover-placeholder" aria-hidden="true">
                <Icon name="album" size="16" />
              </div>
            </div>
            <div class="col-title track-title" role="cell">
              <Icon :name="expandedAlbumId === album.id ? 'chevron-down' : 'chevron-up'" size="12"
                class="expand-icon" />
              {{ album.title }}
            </div>
            <div class="col-artist track-artist" role="cell">{{ album.artist || '-' }}</div>
            <div class="col-duration track-duration" role="cell">{{ album.trackCount }}</div>
            <div class="col-actions track-actions" role="cell" @click.stop>
              <button class="btn-action" @click="playAlbum(album)" :aria-label="'Reproducir ' + album.title">
                <Icon name="play" size="14" />
              </button>
              <button v-if="playerStore.state.currentTrack" class="btn-action" @click="queueAlbum(album)"
                :aria-label="'Agregar ' + album.title + ' a la cola'">
                <Icon name="plus" size="14" />
              </button>
              <div class="actions-more">
                <button class="btn-action" @click="openDropdownId = openDropdownId === album.id ? null : album.id"
                  :aria-label="'Más opciones'">
                  <Icon name="more-vertical" size="16" />
                </button>
                <div v-if="openDropdownId === album.id" class="track-dropdown">
                  <button class="dropdown-item" @click="downloadAlbumZip(album)">
                    <Icon name="download" size="14" />
                    <span>{{ t('common.download') }}</span>
                  </button>
                  <button class="dropdown-item" @click="editAlbum(album)">
                    <Icon name="edit" size="14" />
                    <span>{{ t('common.edit') }}</span>
                  </button>
                  <button class="dropdown-item" @click="toggleAlbumInfo(album.id)">
                    <Icon name="info" size="14" />
                    <span>{{ t('common.info') }}</span>
                  </button>
                  <button class="dropdown-item dropdown-item-danger" @click="confirmDeleteAlbum(album)">
                    <Icon name="trash" size="14" />
                    <span>{{ t('common.delete') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedAlbumId === album.id" class="track-details" role="region"
            :aria-label="'Detalles de ' + album.title">
            <div class="details-content">
              <span class="details-label">{{ t('library.releaseDate') }}:</span>
              <span class="details-value">{{ album.releaseDate ? formatDate(album.releaseDate) :
                t('library.notSpecified') }}</span>
            </div>
            <div v-if="album.totalSize" class="details-content">
              <span class="details-label">{{ t('library.totalSize') }}:</span>
              <span class="details-value">{{ formatFileSize(album.totalSize) }}</span>
            </div>
          </div>

          <div v-if="expandedAlbumId === album.id" class="album-tracks" role="region"
            :aria-label="'Canciones de ' + album.title">
            <div v-if="albumTracksLoading.has(album.id)" class="loading">{{ t('auth.loading') }}</div>
            <div v-else-if="!albumTracksMap[album.id] || albumTracksMap[album.id].length === 0" class="empty-sub">
              <p>{{ t('library.noTracks') }}</p>
            </div>
            <template v-else>
              <div v-for="(track, index) in albumTracksMap[album.id]" :key="track.id" class="track-row album-track-row">
                <div class="col-number track-number">{{ index + 1 }}</div>
                <div class="col-title track-title">{{ track.title }}</div>
                <div class="col-artist track-artist">{{ track.artist || '-' }}</div>
                <div class="col-duration track-duration">{{ formatDuration(track.duration) }}</div>
                <div class="col-actions track-actions">
                  <button class="btn-action" @click="playTrack(album, track)" :aria-label="'Reproducir ' + track.title">
                    <Icon name="play" size="14" />
                  </button>
                  <button v-if="playerStore.state.currentTrack" class="btn-action"
                    @click="playerStore.addToQueue(track)" :aria-label="'Agregar ' + track.title + ' a la cola'">
                    <Icon name="plus" size="14" />
                  </button>
                  <div class="actions-more" @click.stop>
                    <button class="btn-action"
                      @click="openTrackDropdownId = openTrackDropdownId === track.id ? null : track.id"
                      :aria-label="'Más opciones'">
                      <Icon name="more-vertical" size="16" />
                    </button>
                    <div v-if="openTrackDropdownId === track.id" class="track-dropdown">
                      <button class="dropdown-item" @click="downloadTrackFile(track)">
                        <Icon name="download" size="14" />
                        <span>{{ t('common.download') }}</span>
                      </button>
                      <button class="dropdown-item" @click="editAlbumTrack(album, track)">
                        <Icon name="edit" size="14" />
                        <span>{{ t('common.edit') }}</span>
                      </button>
                      <button class="dropdown-item dropdown-item-danger" @click="confirmDeleteAlbumTrack(album, track)">
                        <Icon name="trash" size="14" />
                        <span>{{ t('common.delete') }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <Pagination :current-page="currentPage" :total-pages="totalPages" :total-elements="totalElements"
      :page-size="pageSize" @page-change="goToPage" @page-size-change="changePageSize" />

    <ConfirmDialog :show="showDeleteConfirm" :title="t('confirm.deleteTitle')" :message="deleteMessage"
      :warning="deleteWarning" :loading="deleteLoading" @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false" />

    <UploadAlbumModal :showUpload="showEditModal" :editMode="true" :editData="albumToEdit"
      @update:showUpload="showEditModal = false" @uploaded="onAlbumEditUploaded" />

    <UploadSongsModal :showUpload="showTrackEditModal" :editMode="true" :editData="trackToEdit"
      @update:showUpload="showTrackEditModal = false" @uploaded="onTrackEditUploaded" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { usePlayerStore } from '../../stores/playerStore'
import { formatDuration, formatFileSize } from '../../utils/utils.js'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import CombinedFilter from '../common/CombinedFilter.vue'
import Pagination from '../common/Pagination.vue'
import Icon from '../icons/Icon.vue'
import UploadAlbumModal from '../modals/UploadAlbumModal.vue'
import UploadSongsModal from '../modals/UploadSongsModal.vue'

const { t } = useI18n()
const playerStore = usePlayerStore()

const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const deleteTarget = ref(null)
const deleteMode = ref('')
const deleteMessage = ref('')
const deleteWarning = ref('')

const loading = ref(true)
const search = ref('')
let searchTimeout
const selectedAlbumId = ref(null)
const openDropdownId = ref(null)
const openTrackDropdownId = ref(null)

const albums = ref([])
const expandedAlbumId = ref(null)
const albumTracksMap = ref({})
const albumTracksLoading = ref(new Set())

const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

const selectedArtistIds = ref([])

const sortBy = ref('title')
const sortDirection = ref('asc')
const albumSortOptions = [
  { value: 'title', label: 'Título' },
  { value: 'artist', label: 'Artista' },
  { value: 'year', label: 'Año' },
]

const loadAlbums = async () => {
  try {
    loading.value = true
    const res = await api.getAlbums(
      currentPage.value,
      pageSize.value,
      search.value,
      selectedArtistIds.value,
      sortBy.value,
      sortDirection.value
    )
    albums.value = res.albums
    totalElements.value = res.totalElements
    totalPages.value = res.totalPages
    currentPage.value = res.currentPage
    expandedAlbumId.value = null
    albumTracksMap.value = {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  loadAlbums()
}

const changePageSize = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 0
  loadAlbums()
}

const toggleAlbum = async (albumId) => {
  if (expandedAlbumId.value === albumId) {
    expandedAlbumId.value = null
    return
  }
  expandedAlbumId.value = albumId

  if (albumTracksMap.value[albumId]) return

  albumTracksLoading.value = new Set([...albumTracksLoading.value, albumId])
  try {
    const data = await api.getAlbum(albumId)
    albumTracksMap.value = { ...albumTracksMap.value, [albumId]: data.tracks }
  } catch (e) {
    console.error(e)
  } finally {
    const next = new Set(albumTracksLoading.value)
    next.delete(albumId)
    albumTracksLoading.value = next
  }
}

const playTrack = (album, track) => {
  const tracks = albumTracksMap.value[album.id]
  if (!tracks || tracks.length === 0) return

  const index = tracks.findIndex(t => t.id === track.id)
  if (index === -1) return

  playerStore.clearQueue()
  playerStore.playTrack(track)
  tracks.slice(index + 1).forEach(t => playerStore.addToQueue(t))
}

const playAlbum = async (album) => {
  let tracks = albumTracksMap.value[album.id]
  if (!tracks || tracks.length === 0) {
    try {
      const data = await api.getAlbum(album.id)
      tracks = data.tracks
      albumTracksMap.value = { ...albumTracksMap.value, [album.id]: tracks }
    } catch (e) {
      console.error(e)
      return
    }
  }
  if (!tracks.length) return

  playerStore.clearQueue()
  playerStore.playTrack(tracks[0])
  tracks.slice(1).forEach(t => playerStore.addToQueue(t))
}

const queueAlbum = async (album) => {
  let tracks = albumTracksMap.value[album.id]
  if (!tracks || tracks.length === 0) {
    try {
      const data = await api.getAlbum(album.id)
      tracks = data.tracks
      albumTracksMap.value = { ...albumTracksMap.value, [album.id]: tracks }
    } catch (e) {
      console.error(e)
      return
    }
  }
  tracks.forEach(t => playerStore.addToQueue(t))
}

const showEditModal = ref(false)
const albumToEdit = ref(null)
const showTrackEditModal = ref(false)
const trackToEdit = ref(null)

const editAlbum = async (album) => {
  try {
    albumToEdit.value = await api.getAlbum(album.id)
  } catch (e) {
    albumToEdit.value = album
  }
  showEditModal.value = true
  openDropdownId.value = null
}

const onAlbumEditUploaded = () => {
  showEditModal.value = false
  albumToEdit.value = null
  loadAlbums()
}

const editAlbumTrack = (album, track) => {
  trackToEdit.value = { ...track, album: album.title }
  showTrackEditModal.value = true
  openTrackDropdownId.value = null
}

const onTrackEditUploaded = () => {
  showTrackEditModal.value = false
  trackToEdit.value = null
  if (expandedAlbumId.value) {
    const albumId = expandedAlbumId.value
    api.getAlbum(albumId).then(data => {
      albumTracksMap.value = { ...albumTracksMap.value, [albumId]: data.tracks }
    })
  }
}

const confirmDeleteAlbum = (album) => {
  deleteMode.value = 'album'
  deleteTarget.value = album
  deleteMessage.value = t('confirm.deleteMessage', { item: album.title })
  deleteWarning.value = t('confirm.deleteAlbumWarning')
  showDeleteConfirm.value = true
}

const confirmDeleteAlbumTrack = (album, track) => {
  deleteMode.value = 'track'
  deleteTarget.value = { album, track }
  deleteMessage.value = t('confirm.deleteMessage', { item: track.title })
  deleteWarning.value = ''
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (!deleteTarget.value) return
  deleteLoading.value = true
  try {
    if (deleteMode.value === 'album') {
      await api.deleteAlbum(deleteTarget.value.id)
      expandedAlbumId.value = null
      albumTracksMap.value = {}
      await loadAlbums()
    } else {
      const { album, track } = deleteTarget.value
      await api.deleteTrack(track.id)
      const tracks = (albumTracksMap.value[album.id] || []).filter(t => t.id !== track.id)
      albumTracksMap.value = { ...albumTracksMap.value, [album.id]: tracks }
      const a = albums.value.find(x => x.id === album.id)
      if (a) a.trackCount--
    }
    showDeleteConfirm.value = false
    deleteTarget.value = null
  } catch (e) {
    console.error(e)
  } finally {
    deleteLoading.value = false
  }
}

const downloadAlbumZip = async (album) => {
  openDropdownId.value = null
  try {
    await api.downloadAlbumZip(album.id)
  } catch (e) {
    console.error(e)
  }
}

const downloadTrackFile = async (track) => {
  openTrackDropdownId.value = null
  try {
    await api.downloadTrack(track.id)
  } catch (e) {
    console.error(e)
  }
}

const handleDocumentClick = () => {
  openDropdownId.value = null
  openTrackDropdownId.value = null
  selectedAlbumId.value = null
}

const toggleAlbumInfo = (id) => {
  selectedAlbumId.value = id === selectedAlbumId.value ? null : id
  openDropdownId.value = null
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const refresh = () => {
  loadAlbums()
}

const handleSearch = () => {
  currentPage.value = 0
  loadAlbums()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
})

const clearFilters = () => {
  search.value = ''
  selectedArtistIds.value = []
  sortBy.value = 'title'
  sortDirection.value = 'asc'
  currentPage.value = 0
  loadAlbums()
}

defineExpose({ refresh })

onMounted(async () => {
  await loadAlbums()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  align-items: stretch;
}

.search {
  flex: 2;
  margin-bottom: 0;
}

.search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-wrapper input {
  padding-left: 36px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.filters-bar {
  flex: 1;
  display: flex;
  gap: 8px;
  margin-bottom: 0;
  min-width: 0;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.toolbar-actions .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s, opacity 0.15s;
}

.btn-primary {
  background: var(--accent);
  color: #fff;
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--bg-secondary);
}

.loading {
  text-align: center;
  padding: 32px;
  color: var(--text-secondary);
  font-size: 14px;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 16px;
  color: var(--text-muted);
  gap: 12px;
}

.empty p {
  font-size: 14px;
}

.empty-sub {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.tracks-table {
  display: flex;
  flex-direction: column;
}

.tracks-header {
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 160px;
  gap: 12px;
  padding: 10px 12px;
  font-weight: 500;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
}

.albums-header,
.album-row {
  grid-template-columns: 50px 2fr 1.5fr 80px 160px;
}

.album-row {
  cursor: pointer;
}

.track-row {
  display: grid;
  gap: 12px;
  padding: 10px 12px;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}

.track-row:hover {
  background: var(--bg-secondary);
}

.expand-icon {
  display: inline-block;
  margin-right: 6px;
  color: var(--text-muted);
  flex-shrink: 0;
}

.album-track-row {
  grid-template-columns: 36px 2fr 1.5fr 80px 120px;
  padding-left: 32px;
  background: transparent;
  margin: 1px 0;
  border-radius: 0;
}

.album-track-row:hover {
  background: var(--bg-tertiary);
}

.album-tracks {
  animation: slideDown 0.15s ease;
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.track-title {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
}

.track-number {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.track-artist {
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: var(--text-muted);
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.track-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
  align-items: center;
}

.actions-more {
  position: relative;
}

.track-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 150px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 50;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 14px;
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: background 0.1s;
  text-align: left;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
}

.dropdown-item-danger:hover {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

.btn-action {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  transition: background 0.1s, color 0.1s;
}

.btn-action:hover {
  background: var(--accent-alpha);
  color: var(--accent);
}

.btn-action-danger:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.track-wrapper {
  display: flex;
  flex-direction: column;
}

.track-details {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  margin: 0 12px 8px;
  padding: 10px 16px;
  border: 1px solid var(--border);
  animation: slideDown 0.15s ease;
}

.details-content {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.details-label {
  color: var(--text-muted);
  font-weight: 500;
}

.details-value {
  color: var(--text-primary);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }

  .tracks-header {
    display: none;
  }

  .album-row {
    grid-template-columns: 44px 1fr auto;
    gap: 10px;
  }

  .album-track-row {
    grid-template-columns: 28px 1fr auto;
    padding-left: 20px;
  }

  .col-duration {
    display: none;
  }

  .btn-action {
    width: 30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .album-row {
    grid-template-columns: 40px 1fr auto;
    gap: 8px;
    padding: 8px 8px;
  }

  .track-cover,
  .cover-placeholder {
    width: 36px;
    height: 36px;
  }

  .album-track-row {
    grid-template-columns: 24px 1fr auto;
    padding-left: 16px;
    gap: 6px;
  }

  .album-track-row .track-actions {
    gap: 2px;
  }

  .btn-action {
    width: 28px;
    height: 28px;
  }

  .track-details {
    margin: 0 8px 6px;
    padding: 8px 12px;
  }
}
</style>
