<template>
  <div>
    <div class="toolbar">
      <div class="search" role="search">
        <div class="search-wrapper">
          <Icon name="search" size="16" class="search-icon" />
          <input v-model="search" type="text" :placeholder="t('library.searchPlaceholder')"
            aria-label="Buscar canciones" @keyup.enter="handleSearch" />
        </div>
      </div>
      <CombinedFilter
        v-model:artistIds="selectedArtistIds"
        v-model:albumIds="selectedAlbumIds"
        :artistOptions="userArtists.map(a => ({ id: a.id, label: a.name }))"
        :albumOptions="userAlbums.map(a => ({ id: a.id, label: a.title }))"
        :artistPlaceholder="t('library.filterByArtist')"
        :albumPlaceholder="t('library.filterByAlbum')"
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
      <div v-if="tracks.length === 0" class="empty">
        <Icon name="empty" size="48" />
        <p>{{ t('library.noTracks') }}</p>
      </div>
      <div v-else class="tracks-table" role="table" aria-label="Lista de canciones">
        <div class="tracks-header" role="row">
          <div class="col-cover" role="columnheader"></div>
          <div class="col-title" role="columnheader">{{ t('library.trackTitle') }}</div>
          <div class="col-artist" role="columnheader">{{ t('library.trackArtist') }}</div>
          <div class="col-album" role="columnheader">{{ t('library.album') }}</div>
          <div class="col-duration" role="columnheader">{{ t('library.duration') }}</div>
          <div class="col-actions" role="columnheader"></div>
        </div>
        <div v-for="track in tracks" :key="track.id" class="track-wrapper">
          <div class="track-row" role="row">
            <div class="col-cover" role="cell">
              <img v-if="track.cover" :src="track.cover" alt="" class="track-cover" />
              <div v-else class="cover-placeholder" aria-hidden="true">
                <Icon name="music" size="16" />
              </div>
            </div>
            <div class="col-title track-title" role="cell">{{ track.title }}</div>
            <div class="col-artist track-artist" role="cell">{{ track.artist || '-' }}</div>
            <div class="col-album track-album" role="cell">{{ track.album || '-' }}</div>
            <div class="col-duration track-duration" role="cell">{{ formatDuration(track.duration) }}</div>
            <div class="col-actions track-actions" role="cell">
              <button class="btn-action" @click="playTrack(track)" :aria-label="'Reproducir ' + track.title">
                <Icon name="play" size="14" />
              </button>
              <button v-if="playerStore.state.currentTrack" class="btn-action" @click="playerStore.addToQueue(track)"
                :aria-label="'Agregar ' + track.title + ' a la cola'">
                <Icon name="plus" size="14" />
              </button>
              <div class="actions-more" @click.stop>
                <button class="btn-action" @click="openDropdownId = openDropdownId === track.id ? null : track.id"
                  :aria-label="'Más opciones'">
                  <Icon name="more-vertical" size="16" />
                </button>
                <div v-if="openDropdownId === track.id" class="track-dropdown">
                  <button class="dropdown-item" @click="downloadTrackFile(track)">
                    <Icon name="download" size="14" />
                    <span>{{ t('common.download') }}</span>
                  </button>
                  <button class="dropdown-item" @click="editTrack(track)">
                    <Icon name="edit" size="14" />
                    <span>{{ t('common.edit') }}</span>
                  </button>
                  <button class="dropdown-item" @click="toggleInfo(track.id)">
                    <Icon name="info" size="14" />
                    <span>{{ t('common.info') }}</span>
                  </button>
                  <button class="dropdown-item dropdown-item-danger" @click="confirmDelete(track)">
                    <Icon name="trash" size="14" />
                    <span>{{ t('common.delete') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div v-if="selectedTrackId === track.id" class="track-details" role="region"
            :aria-label="'Detalles de ' + track.title">
            <div class="details-content">
              <span class="details-label">{{ t('library.releaseDate') }}:</span>
              <span class="details-value">{{ track.releaseDate ? formatDate(track.releaseDate) :
                t('library.notSpecified') }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Pagination :current-page="currentPage" :total-pages="totalPages" :total-elements="totalElements"
      :page-size="pageSize" @page-change="goToPage" @page-size-change="changePageSize" />

    <ConfirmDialog :show="showDeleteConfirm" :title="t('confirm.deleteTitle')" :message="deleteMessage"
      :loading="deleteLoading" @confirm="handleDeleteConfirm" @cancel="showDeleteConfirm = false" />

    <UploadSongsModal :showUpload="showEditModal" :editMode="true" :editData="trackToEdit"
      @update:showUpload="showEditModal = false" @uploaded="onEditUploaded" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { usePlayerStore } from '../../stores/playerStore'
import { formatDuration } from '../../utils/utils.js'
import CombinedFilter from '../common/CombinedFilter.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import Pagination from '../common/Pagination.vue'
import Icon from '../icons/Icon.vue'
import UploadSongsModal from '../modals/UploadSongsModal.vue'

const { t } = useI18n()
const playerStore = usePlayerStore()

const loading = ref(true)
const search = ref('')
let searchTimeout
const selectedTrackId = ref(null)
const openDropdownId = ref(null)

const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const trackToDelete = ref(null)
const deleteMessage = ref('')

const showEditModal = ref(false)
const trackToEdit = ref(null)

const selectedArtistIds = ref([])
const selectedAlbumIds = ref([])
const userArtists = ref([])
const userAlbums = ref([])

const editTrack = (track) => {
  trackToEdit.value = track
  showEditModal.value = true
  openDropdownId.value = null
}

const onEditUploaded = () => {
  showEditModal.value = false
  trackToEdit.value = null
  loadTracks()
}

const tracks = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

const loadTracks = async () => {
  try {
    loading.value = true
    const res = await api.getTracks(
      currentPage.value,
      pageSize.value,
      search.value,
      selectedArtistIds.value,
      selectedAlbumIds.value
    )
    tracks.value = res.tracks
    totalElements.value = res.totalElements
    totalPages.value = res.totalPages
    currentPage.value = res.currentPage
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const loadUserArtists = async () => {
  try {
    userArtists.value = await api.getArtistsList()
  } catch (e) {
    console.error(e)
  }
}

const loadUserAlbums = async (artistIds = []) => {
  try {
    userAlbums.value = await api.getAlbumsList(artistIds)
  } catch (e) {
    console.error(e)
  }
}

const goToPage = (page) => {
  currentPage.value = page
  loadTracks()
}

const changePageSize = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 0
  loadTracks()
}

const playTrack = (track) => {
  playerStore.clearQueue()
  playerStore.playTrack(track)
}

const handleDocumentClick = () => {
  openDropdownId.value = null
  selectedTrackId.value = null
}

const toggleInfo = (id) => {
  selectedTrackId.value = id === selectedTrackId.value ? null : id
  openDropdownId.value = null
}

const confirmDelete = (track) => {
  trackToDelete.value = track
  deleteMessage.value = t('confirm.deleteMessage', { item: track.title })
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (!trackToDelete.value) return
  deleteLoading.value = true
  try {
    await api.deleteTrack(trackToDelete.value.id)
    showDeleteConfirm.value = false
    trackToDelete.value = null
    await loadTracks()
  } catch (e) {
    console.error(e)
  } finally {
    deleteLoading.value = false
  }
}

const downloadTrackFile = async (track) => {
  openDropdownId.value = null
  try {
    await api.downloadTrack(track.id)
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const refresh = () => {
  loadTracks()
}

const handleSearch = () => {
  currentPage.value = 0
  loadTracks()
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
  selectedAlbumIds.value = []
  currentPage.value = 0
  loadTracks()
}

watch(selectedArtistIds, (newIds) => {
  selectedAlbumIds.value = []
  loadUserAlbums(newIds)
}, { deep: true })

defineExpose({ refresh })

onMounted(async () => {
  await Promise.all([loadTracks(), loadUserArtists(), loadUserAlbums()])
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
  align-items: center;
}

.search {
  flex: 1;
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

.track-row {
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 160px;
  gap: 12px;
  padding: 10px 12px;
  align-items: center;
  border-radius: var(--radius-sm);
  transition: background 0.1s;
}

.track-row:hover {
  background: var(--bg-secondary);
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
}

.track-artist,
.track-album {
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

  .track-row {
    grid-template-columns: 44px 1fr auto;
    gap: 10px;
  }

  .col-album {
    display: none;
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
  .track-row {
    grid-template-columns: 40px 1fr auto;
    gap: 8px;
    padding: 8px 8px;
  }

  .col-artist {
    display: none;
  }

  .track-cover,
  .cover-placeholder {
    width: 36px;
    height: 36px;
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
