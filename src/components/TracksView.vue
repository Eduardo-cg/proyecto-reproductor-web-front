<template>
  <div>
    <div class="search">
      <input v-model="search" type="text" :placeholder="t('library.searchPlaceholder')" />
    </div>

    <div v-if="loading" class="loading">{{ t('auth.loading') }}</div>

    <template v-else>
      <div v-if="filteredTracks.length === 0" class="empty">{{ t('library.noTracks') }}</div>
      <div v-else class="tracks-table">
        <div class="tracks-header">
          <div class="col-cover"></div>
          <div class="col-title">{{ t('library.trackTitle') }}</div>
          <div class="col-artist">{{ t('library.trackArtist') }}</div>
          <div class="col-album">{{ t('library.album') }}</div>
          <div class="col-duration">{{ t('library.duration') }}</div>
          <div class="col-actions"></div>
        </div>
        <div v-for="track in filteredTracks" :key="track.id" class="track-wrapper">
          <div class="track-row">
            <div class="col-cover">
              <img v-if="track.cover" :src="track.cover" alt="Cover" class="track-cover" />
              <div v-else class="preview-cover-placeholder">&#127925;</div>
            </div>
            <div class="col-title track-title">{{ track.title }}</div>
            <div class="col-artist track-artist">{{ track.artistDisplay || '-' }}</div>
            <div class="col-album track-album">{{ track.album || '-' }}</div>
            <div class="col-duration track-duration">{{ formatDuration(track.duration) }}</div>
            <div class="col-actions track-actions">
              <button class="btn-play" @click="playTrack(track)" :title="t('player.play')">&#9654;</button>
              <button v-if="playerStore.state.currentTrack" class="btn-queue" @click="playerStore.addToQueue(track)"
                :title="t('player.addToQueue')">&#10133;</button>
              <button class="btn-info" @click.stop="toggleInfo(track.id)" :title="t('library.info')">&#8505;&#65039;</button>
              <button class="btn-delete" @click="deleteTrack(track.id)" :title="t('library.delete')">&#128465;</button>
            </div>
          </div>
          <div v-if="selectedTrackId === track.id" class="track-details">
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
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Pagination from '../components/Pagination.vue'
import { api } from '../services/api'
import { usePlayerStore } from '../stores/playerStore'
import { formatDuration } from '../utils/format'

const { t } = useI18n()
const playerStore = usePlayerStore()

const loading = ref(true)
const search = ref('')
const selectedTrackId = ref(null)

const tracks = ref([])
const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

const filteredTracks = computed(() => {
  if (!search.value) return tracks.value
  const s = search.value.toLowerCase()
  return tracks.value.filter(t =>
    t.title.toLowerCase().includes(s) ||
    (t.artistDisplay && t.artistDisplay.toLowerCase().includes(s)) ||
    (t.album && t.album.toLowerCase().includes(s))
  )
})

const loadTracks = async () => {
  try {
    loading.value = true
    const res = await api.getTracks(currentPage.value, pageSize.value)
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
  selectedTrackId.value = null
}

const toggleInfo = (id) => {
  selectedTrackId.value = id
}

const deleteTrack = async (id) => {
  await api.deleteTrack(id)
  await loadTracks()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const refresh = () => {
  loadTracks()
}

defineExpose({ refresh })

onMounted(() => {
  loadTracks()
  document.addEventListener('click', handleDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.search {
  margin-bottom: 30px;
}

.tracks-table {
  display: flex;
  flex-direction: column;
}

.tracks-header {
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 180px;
  gap: 15px;
  padding: 12px 15px;
  font-weight: 600;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.track-row {
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 180px;
  gap: 15px;
  padding: 12px 15px;
  align-items: center;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}

.track-row:hover {
  background: var(--bg-secondary);
}

.track-cover {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.track-title {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist,
.track-album {
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: var(--text-secondary);
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}

.track-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-play,
.btn-info,
.btn-delete {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 16px;
  transition: background 0.15s;
}

.btn-play:hover {
  background: var(--accent);
  color: white;
}

.btn-queue {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 16px;
  transition: background 0.15s;
}

.btn-queue:hover {
  background: #2ecc71;
  color: white;
}

.btn-info:hover {
  background: #3498db;
  color: white;
}

.btn-delete:hover {
  background: #e74c3c;
  color: white;
}

.track-wrapper {
  display: flex;
  flex-direction: column;
}

.track-details {
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  margin: 0 15px 10px;
  padding: 12px 20px;
  animation: slideDown 0.2s ease;
}

.details-content {
  display: flex;
  gap: 8px;
  font-size: 14px;
}

.details-label {
  color: var(--text-secondary);
  font-weight: 600;
}

.details-value {
  color: var(--text-primary);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .tracks-header {
    display: none;
  }

  .track-row {
    grid-template-columns: 44px 1fr auto;
    gap: 12px;
  }

  .col-album,
  .col-duration {
    display: none;
  }
}
</style>
