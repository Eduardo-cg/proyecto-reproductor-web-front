<template>
  <div>
    <div class="toolbar">
      <div class="search" role="search">
        <div class="search-wrapper">
          <Icon name="search" size="16" class="search-icon" />
          <input v-model="search" type="text" :placeholder="t('library.artistSearchPlaceholder')"
            aria-label="Buscar artistas" @keyup.enter="handleSearch" />
        </div>
      </div>
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
      <div v-if="artists.length === 0" class="empty">
        <Icon name="empty" size="48" />
        <p>{{ t('library.noArtists') }}</p>
      </div>

      <div v-else class="artists-grid" role="list" aria-label="Lista de artistas">
        <div v-for="artist in artists" :key="artist.id" class="artist-card-wrapper">
          <div class="artist-card" @click="toggleExpand(artist.id)" role="listitem"
            :aria-expanded="expandedArtistId === artist.id">
            <div class="artist-image">
              <img v-if="artist.image" :src="artist.image" alt="" class="artist-img" />
              <div v-else class="artist-placeholder">
                <Icon name="artist" size="24" />
              </div>
            </div>
            <div class="artist-info">
              <span class="artist-name">{{ artist.name }}</span>
              <div class="artist-counts">
                <span class="count-badge">
                  <Icon name="music" size="10" />
                  {{ artist.trackCount }}
                </span>
                <span class="count-badge">
                  <Icon name="album" size="10" />
                  {{ artist.albumCount }}
                </span>
              </div>
            </div>
            <div class="artist-actions" @click.stop>
              <button class="btn-action" @click="openDropdownId = openDropdownId === artist.id ? null : artist.id"
                :aria-label="'Más opciones'">
                <Icon name="more-vertical" size="16" />
              </button>
              <div v-if="openDropdownId === artist.id" class="artist-dropdown">
                <button class="dropdown-item" @click="downloadArtist(artist)">
                  <Icon name="download" size="14" />
                  <span>{{ t('common.download') }}</span>
                </button>
                <button class="dropdown-item" @click="editArtist(artist)">
                  <Icon name="edit" size="14" />
                  <span>{{ t('common.edit') }}</span>
                </button>
                <button class="dropdown-item dropdown-item-danger" @click="confirmDeleteArtist(artist)">
                  <Icon name="trash" size="14" />
                  <span>{{ t('common.delete') }}</span>
                </button>
              </div>
            </div>
          </div>

          <ArtistExpanded v-if="expandedArtistId === artist.id" :artist-id="artist.id" />
        </div>
      </div>
    </template>

    <ConfirmDialog :show="showDeleteConfirm" :title="t('confirm.deleteTitle')" :message="deleteDialogMessage"
      :warning="deleteDialogWarning" :loading="deleteLoading" @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false" />

    <UploadArtistModal :showUpload="showEditModal" :editMode="true" :editData="artistToEdit"
      @update:showUpload="showEditModal = false" @uploaded="onEditUploaded" />

    <Pagination :current-page="currentPage" :total-pages="totalPages" :total-elements="totalElements"
      :page-size="pageSize" @page-change="goToPage" @page-size-change="changePageSize" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import Pagination from '../common/Pagination.vue'
import Icon from '../icons/Icon.vue'
import ArtistExpanded from './ArtistExpanded.vue'
import UploadArtistModal from '../modals/UploadArtistModal.vue'

const { t } = useI18n()

const loading = ref(true)
const search = ref('')
let searchTimeout
const expandedArtistId = ref(null)

const artists = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)
const openDropdownId = ref(null)

const showDeleteConfirm = ref(false)
const deleteLoading = ref(false)
const artistToDelete = ref(null)
const deleteDialogMessage = ref('')
const deleteDialogWarning = ref('')

const loadArtists = async () => {
  try {
    loading.value = true
    const data = await api.getArtists(currentPage.value, pageSize.value, search.value)
    artists.value = data.artists
    totalElements.value = data.totalElements
    totalPages.value = data.totalPages
    currentPage.value = data.currentPage
    expandedArtistId.value = null
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  currentPage.value = page
  loadArtists()
}

const changePageSize = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 0
  loadArtists()
}

const toggleExpand = (artistId) => {
  expandedArtistId.value = expandedArtistId.value === artistId ? null : artistId
}

const downloadArtist = async (artist) => {
  openDropdownId.value = null
  try {
    await api.downloadArtistZip(artist.id)
  } catch (e) {
    console.error(e)
  }
}

const handleDocumentClick = () => {
  openDropdownId.value = null
}

const showEditModal = ref(false)
const artistToEdit = ref(null)

const editArtist = (artist) => {
  artistToEdit.value = artist
  showEditModal.value = true
  openDropdownId.value = null
}

const onEditUploaded = () => {
  showEditModal.value = false
  artistToEdit.value = null
  loadArtists()
}

const confirmDeleteArtist = (artist) => {
  artistToDelete.value = artist
  deleteDialogMessage.value = t('confirm.deleteMessage', { item: artist.name })

  if (artist.trackCount > 0 || artist.albumCount > 0) {
    deleteDialogWarning.value = t('confirm.deleteArtistWithContent', {
      tracks: artist.trackCount,
      albums: artist.albumCount
    })
  } else {
    deleteDialogWarning.value = ''
  }
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async () => {
  if (!artistToDelete.value) return
  deleteLoading.value = true
  try {
    await api.deleteArtist(artistToDelete.value.id)
    showDeleteConfirm.value = false
    artistToDelete.value = null
    await loadArtists()
  } catch (e) {
    console.error(e)
  } finally {
    deleteLoading.value = false
  }
}

const refresh = () => {
  loadArtists()
}

const handleSearch = () => {
  currentPage.value = 0
  loadArtists()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
})

const clearFilters = () => {
  search.value = ''
  currentPage.value = 0
  loadArtists()
}

defineExpose({ refresh })

onMounted(() => {
  loadArtists()
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

.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.artist-card-wrapper {
  display: flex;
  flex-direction: column;
}

.artist-card {
  background: var(--bg-secondary);
  border-radius: var(--radius);
  padding: 16px;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  position: relative;
  border: 1px solid var(--border);
}

.artist-card:hover {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.artist-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.artist-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.artist-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.artist-info {
  text-align: center;
  min-width: 0;
  width: 100%;
}

.artist-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.artist-counts {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 6px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: 10px;
}

.artist-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 2px;
}

.btn-action {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: rgba(0, 0, 0, 0.3);
  color: var(--text-secondary);
  transition: background 0.1s, color 0.1s;
  border: none;
  cursor: pointer;
}

.btn-action:hover {
  background: var(--accent-alpha);
  color: var(--accent);
}

.btn-action-danger:hover {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
}

.artist-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  min-width: 160px;
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

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
  }

  .artists-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 12px;
  }

  .artist-image {
    width: 64px;
    height: 64px;
  }
}

@media (max-width: 480px) {
  .artists-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .artist-card {
    padding: 12px;
  }

  .artist-image {
    width: 56px;
    height: 56px;
  }

  .artist-name {
    font-size: 13px;
  }
}
</style>
