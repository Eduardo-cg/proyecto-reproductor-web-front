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

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import type { ArtistDTO } from '../../types'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import Pagination from '../common/Pagination.vue'
import Icon from '../icons/Icon.vue'
import UploadArtistModal from '../modals/UploadArtistModal.vue'
import ArtistExpanded from './ArtistExpanded.vue'

const { t } = useI18n()

const loading = ref<boolean>(true)
const search = ref<string>('')
let searchTimeout: ReturnType<typeof setTimeout>
const expandedArtistId = ref<number | null>(null)

const artists = ref<ArtistDTO[]>([])
const currentPage = ref<number>(0)
const pageSize = ref<number>(20)
const totalElements = ref<number>(0)
const totalPages = ref<number>(0)
const openDropdownId = ref<number | null>(null)

const showDeleteConfirm = ref<boolean>(false)
const deleteLoading = ref<boolean>(false)
const artistToDelete = ref<ArtistDTO | null>(null)
const deleteDialogMessage = ref<string>('')
const deleteDialogWarning = ref<string>('')

const loadArtists = async (): Promise<void> => {
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

const goToPage = (page: number): void => {
  currentPage.value = page
  loadArtists()
}

const changePageSize = (newSize: number): void => {
  pageSize.value = newSize
  currentPage.value = 0
  loadArtists()
}

const toggleExpand = (artistId: number): void => {
  expandedArtistId.value = expandedArtistId.value === artistId ? null : artistId
}

const downloadArtist = async (artist: ArtistDTO): Promise<void> => {
  openDropdownId.value = null
  try {
    await api.downloadArtistZip(artist.id)
  } catch (e) {
    console.error(e)
  }
}

const handleDocumentClick = (): void => {
  openDropdownId.value = null
}

const showEditModal = ref<boolean>(false)
const artistToEdit = ref<ArtistDTO | null>(null)

const editArtist = (artist: ArtistDTO): void => {
  artistToEdit.value = artist
  showEditModal.value = true
  openDropdownId.value = null
}

const onEditUploaded = (): void => {
  showEditModal.value = false
  artistToEdit.value = null
  loadArtists()
}

const confirmDeleteArtist = (artist: ArtistDTO): void => {
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

const handleDeleteConfirm = async (): Promise<void> => {
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

const refresh = (): void => {
  loadArtists()
}

const handleSearch = (): void => {
  currentPage.value = 0
  loadArtists()
}

watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleSearch()
  }, 300)
})

const clearFilters = (): void => {
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

.artist-dropdown {
  min-width: 160px;
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
