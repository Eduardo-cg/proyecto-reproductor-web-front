<template>
  <div>
    <div class="toolbar">
      <div
        class="search"
        role="search"
      >
        <div class="search-wrapper">
          <Icon
            name="search"
            size="16"
            class="search-icon"
          />
          <input
            v-model="search"
            type="text"
            :placeholder="t('library.searchPlaceholder')"
            aria-label="Buscar canciones"
            @keyup.enter="handleSearch"
          >
        </div>
      </div>
      <CombinedFilter
        v-model:artist-ids="selectedArtistIds"
        v-model:album-ids="selectedAlbumIds"
        v-model:sort-by="sortBy"
        v-model:sort-direction="sortDirection"
        :sort-options="trackSortOptions"
      />
      <div class="toolbar-actions">
        <button
          class="btn btn-primary"
          @click="handleSearch"
        >
          <Icon
            name="search"
            size="14"
          />
          {{ t('library.search') }}
        </button>
        <button
          class="btn btn-secondary"
          @click="clearFilters"
        >
          {{ t('library.clearFilters') }}
        </button>
      </div>
    </div>

    <div
      v-if="loading"
      class="loading"
      role="status"
    >
      {{ t('auth.loading') }}
    </div>

    <template v-else>
      <div
        v-if="tracks.length === 0"
        class="empty"
      >
        <Icon
          name="empty"
          size="48"
        />
        <p>{{ t('library.noTracks') }}</p>
      </div>
      <div
        v-else
        class="tracks-table"
        role="table"
        aria-label="Lista de canciones"
      >
        <div
          class="tracks-header"
          role="row"
        >
          <div
            class="col-cover"
            role="columnheader"
          />
          <div
            class="col-title"
            role="columnheader"
          >
            {{ t('library.trackTitle') }}
          </div>
          <div
            class="col-artist"
            role="columnheader"
          >
            {{ t('library.trackArtist') }}
          </div>
          <div
            class="col-album"
            role="columnheader"
          >
            {{ t('library.album') }}
          </div>
          <div
            class="col-duration"
            role="columnheader"
          >
            {{ t('library.duration') }}
          </div>
          <div
            class="col-actions"
            role="columnheader"
          />
        </div>
        <div
          v-for="track in tracks"
          :key="track.id"
          v-memo="[track, selectedTrackId === track.id, openDropdownId === track.id, playerStore.state.currentTrack?.id ?? null]"
          class="track-wrapper"
        >
          <div
            class="track-row"
            role="row"
          >
            <div
              class="col-cover"
              role="cell"
            >
              <img
                v-if="track.cover"
                :src="track.cover"
                alt=""
                class="track-cover"
              >
              <div
                v-else
                class="cover-placeholder"
                aria-hidden="true"
              >
                <Icon
                  name="music"
                  size="16"
                />
              </div>
            </div>
            <div
              class="col-title track-title"
              role="cell"
            >
              {{ track.title }}
            </div>
            <div
              class="col-artist track-artist"
              role="cell"
            >
              {{ track.artist || '-' }}
            </div>
            <div
              class="col-album track-album"
              role="cell"
            >
              {{ track.album || '-' }}
            </div>
            <div
              class="col-duration track-duration"
              role="cell"
            >
              {{ formatDuration(track.duration) }}
            </div>
            <div
              class="col-actions track-actions"
              role="cell"
            >
              <button
                class="btn-action"
                :aria-label="'Reproducir ' + track.title"
                @click="playTrack(track)"
              >
                <Icon
                  name="play"
                  size="14"
                />
              </button>
              <button
                v-if="playerStore.state.currentTrack"
                class="btn-action"
                :aria-label="'Agregar ' + track.title + ' a la cola'"
                @click="playerStore.addToQueue(track)"
              >
                <Icon
                  name="plus"
                  size="14"
                />
              </button>
              <div
                class="actions-more"
                @click.stop
              >
                <button
                  class="btn-action"
                  :aria-label="'Más opciones'"
                  @click="openDropdownId = openDropdownId === track.id ? null : track.id"
                >
                  <Icon
                    name="more-vertical"
                    size="16"
                  />
                </button>
                <div
                  v-if="openDropdownId === track.id"
                  class="track-dropdown"
                >
                  <button
                    class="dropdown-item"
                    @click="downloadTrackFile(track)"
                  >
                    <Icon
                      name="download"
                      size="14"
                    />
                    <span>{{ t('common.download') }}</span>
                  </button>
                  <button
                    class="dropdown-item"
                    @click="editTrack(track)"
                  >
                    <Icon
                      name="edit"
                      size="14"
                    />
                    <span>{{ t('common.edit') }}</span>
                  </button>
                  <button
                    class="dropdown-item"
                    @click="toggleInfo(track.id)"
                  >
                    <Icon
                      name="info"
                      size="14"
                    />
                    <span>{{ t('common.info') }}</span>
                  </button>
                  <button
                    class="dropdown-item dropdown-item-danger"
                    @click="confirmDelete(track)"
                  >
                    <Icon
                      name="trash"
                      size="14"
                    />
                    <span>{{ t('common.delete') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            v-if="selectedTrackId === track.id"
            class="track-details"
            role="region"
            :aria-label="'Detalles de ' + track.title"
          >
            <div class="details-content">
              <span class="details-label">{{ t('library.releaseDate') }}:</span>
              <span class="details-value">{{ track.releaseDate ? formatDate(track.releaseDate) :
                t('library.notSpecified') }}</span>
            </div>
            <div
              v-if="track.fileSize"
              class="details-content"
            >
              <span class="details-label">{{ t('library.fileSize') }}:</span>
              <span class="details-value">{{ formatFileSize(track.fileSize) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Pagination
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-elements="totalElements"
      :page-size="pageSize"
      @page-change="goToPage"
      @page-size-change="changePageSize"
    />

    <ConfirmDialog
      :show="showDeleteConfirm"
      :title="t('confirm.deleteTitle')"
      :message="deleteMessage"
      :loading="deleteLoading"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false"
    />

    <UploadSongsModal
      v-model:show-upload="showEditModal"
      :edit-mode="true"
      :edit-data="trackToEdit ?? undefined"
      @uploaded="onEditUploaded"
    />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { usePlayerStore } from '../../stores/playerStore'
import { useTracksList } from '../../composables/useTracksList'
import type { TrackDTO } from '../../types'
import { formatDuration, formatFileSize } from '../../utils/utils'
import CombinedFilter from '../common/CombinedFilter.vue'
import ConfirmDialog from '../common/ConfirmDialog.vue'
import Pagination from '../common/Pagination.vue'
import Icon from '../icons/Icon.vue'
import UploadSongsModal from '../modals/UploadSongsModal.vue'

const { t } = useI18n()
const playerStore = usePlayerStore()

const {
  tracks,
  loading,
  currentPage,
  pageSize,
  totalElements,
  totalPages,
  search,
  sortBy,
  sortDirection,
  selectedArtistIds,
  selectedAlbumIds,
  loadTracks,
  goToPage,
  changePageSize,
  handleSearch,
  debouncedSearch,
  clearFilters
} = useTracksList()

const selectedTrackId = ref<number | null>(null)
const openDropdownId = ref<number | null>(null)

const showDeleteConfirm = ref<boolean>(false)
const deleteLoading = ref<boolean>(false)
const trackToDelete = ref<TrackDTO | null>(null)
const deleteMessage = ref<string>('')

const showEditModal = ref<boolean>(false)
const trackToEdit = ref<TrackDTO | null>(null)

const trackSortOptions = [
  { value: 'title', label: 'Título' },
  { value: 'artist', label: 'Artista' },
  { value: 'album', label: 'Álbum' },
  { value: 'year', label: 'Año' },
  { value: 'duration', label: 'Duración' },
]

const editTrack = (track: TrackDTO): void => {
  trackToEdit.value = track
  showEditModal.value = true
  openDropdownId.value = null
}

const onEditUploaded = (): void => {
  showEditModal.value = false
  trackToEdit.value = null
  loadTracks()
}

const playTrack = (track: TrackDTO): void => {
  playerStore.clearQueue()
  playerStore.playTrack(track)
}

const handleDocumentClick = (): void => {
  openDropdownId.value = null
  selectedTrackId.value = null
}

const toggleInfo = (id: number): void => {
  selectedTrackId.value = id === selectedTrackId.value ? null : id
  openDropdownId.value = null
}

const confirmDelete = (track: TrackDTO): void => {
  trackToDelete.value = track
  deleteMessage.value = t('confirm.deleteMessage', { item: track.title })
  showDeleteConfirm.value = true
}

const handleDeleteConfirm = async (): Promise<void> => {
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

const downloadTrackFile = async (track: TrackDTO): Promise<void> => {
  openDropdownId.value = null
  try {
    await api.downloadTrack(track.id)
  } catch (e) {
    console.error(e)
  }
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

watch(search, () => {
  debouncedSearch()
})

onMounted(async () => {
  await loadTracks()
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
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
