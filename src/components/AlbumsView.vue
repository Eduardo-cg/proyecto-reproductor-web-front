<template>
  <div>
    <div class="search">
      <input v-model="search" type="text" :placeholder="t('library.albumSearchPlaceholder')" />
    </div>

    <div v-if="loading" class="loading">{{ t('auth.loading') }}</div>

    <template v-else>
      <div v-if="filteredAlbums.length === 0" class="empty">{{ t('library.noAlbums') }}</div>
      <div v-else class="tracks-table">
        <div class="tracks-header albums-header">
          <div class="col-cover"></div>
          <div class="col-title">{{ t('library.albumName') }}</div>
          <div class="col-artist">{{ t('library.trackArtist') }}</div>
          <div class="col-duration">{{ t('library.albumCount').replace('{count}', '') }}</div>
          <div class="col-actions"></div>
        </div>
        <div v-for="album in filteredAlbums" :key="album.id" class="track-wrapper">
          <div class="track-row album-row" @click="toggleAlbum(album.id)">
            <div class="col-cover">
              <img v-if="album.cover" :src="album.cover" alt="Cover" class="track-cover" />
              <div v-else class="preview-cover-placeholder">&#127925;</div>
            </div>
            <div class="col-title track-title">
              <span class="expand-icon">{{ expandedAlbumId === album.id ? '&#9660;' : '&#9654;' }}</span>
              {{ album.title }}
            </div>
            <div class="col-artist track-artist">{{ album.artistDisplay || '-' }}</div>
            <div class="col-duration track-duration">{{ album.trackCount }}</div>
            <div class="col-actions track-actions">
              <button class="btn-play" @click.stop="playAlbum(album)" :title="t('player.play')">&#9654;</button>
              <button v-if="playerStore.state.currentTrack" class="btn-queue" @click.stop="queueAlbum(album)"
                :title="t('player.addToQueue')">&#10133;</button>
              <button class="btn-info" @click.stop="toggleAlbumInfo(album.id)"
                :title="t('library.info')">&#8505;&#65039;</button>
              <button class="btn-delete" @click.stop="deleteAlbum(album.id)"
                :title="t('library.deleteAlbum')">&#128465;</button>
            </div>
          </div>
          <div v-if="selectedAlbumId === album.id" class="track-details">
            <div class="details-content">
              <span class="details-label">{{ t('library.releaseDate') }}:</span>
              <span class="details-value">{{ album.releaseDate ? formatDate(album.releaseDate) : t('library.notSpecified') }}</span>
            </div>
          </div>

          <!-- Expanded tracks -->
          <div v-if="expandedAlbumId === album.id" class="album-tracks">
            <div v-if="albumTracksLoading.has(album.id)" class="loading">{{ t('auth.loading') }}</div>
            <div v-else-if="!albumTracksMap[album.id] || albumTracksMap[album.id].length === 0" class="empty">{{
              t('library.noTracks') }}</div>
            <template v-else>
              <div v-for="track in albumTracksMap[album.id]" :key="track.id" class="track-row album-track-row">
                <div class="col-title track-title">{{ track.title }}</div>
                <div class="col-artist track-artist">{{ track.artistDisplay || '-' }}</div>
                <div class="col-duration track-duration">{{ formatDuration(track.duration) }}</div>
                <div class="col-actions track-actions">
                  <button class="btn-play" @click="playTrack(track)" :title="t('player.play')">&#9654;</button>
                  <button v-if="playerStore.state.currentTrack" class="btn-queue" @click="playerStore.addToQueue(track)"
                    :title="t('player.addToQueue')">&#10133;</button>
                  <button class="btn-delete" @click="deleteAlbumTrack(album.id, track.id)"
                    :title="t('library.delete')">&#128465;</button>
                </div>
              </div>
            </template>
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
const selectedAlbumId = ref(null)

const albums = ref([])
const expandedAlbumId = ref(null)
const albumTracksMap = ref({})
const albumTracksLoading = ref(new Set())

const currentPage = ref(0)
const pageSize = ref(20)
const totalElements = ref(0)
const totalPages = ref(0)

const filteredAlbums = computed(() => {
  if (!search.value) return albums.value
  const s = search.value.toLowerCase()
  return albums.value.filter(a =>
    a.title.toLowerCase().includes(s) ||
    (a.artistDisplay && a.artistDisplay.toLowerCase().includes(s))
  )
})

const loadAlbums = async () => {
  try {
    loading.value = true
    const res = await api.getAlbums(currentPage.value, pageSize.value)
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

const playTrack = (track) => {
  playerStore.clearQueue()
  playerStore.playTrack(track)
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

const deleteAlbum = async (id) => {
  await api.deleteAlbum(id)
  expandedAlbumId.value = null
  albumTracksMap.value = {}
  await loadAlbums()
}

const deleteAlbumTrack = async (albumId, trackId) => {
  await api.deleteTrack(trackId)
  const tracks = (albumTracksMap.value[albumId] || []).filter(t => t.id !== trackId)
  albumTracksMap.value = { ...albumTracksMap.value, [albumId]: tracks }
  const album = albums.value.find(a => a.id === albumId)
  if (album) album.trackCount--
}

const handleDocumentClick = () => {
  selectedAlbumId.value = null
}

const toggleAlbumInfo = (id) => {
  selectedAlbumId.value = id
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const refresh = () => {
  loadAlbums()
}

defineExpose({ refresh })

onMounted(() => {
  loadAlbums()
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

.albums-header,
.album-row {
  grid-template-columns: 50px 2fr 1.5fr 80px 180px;
}

.album-row {
  cursor: pointer;
}

.track-row {
  display: grid;
  gap: 15px;
  padding: 12px 15px;
  align-items: center;
  border-radius: var(--radius-md);
  transition: background 0.15s;
}

.track-row:hover {
  background: var(--bg-secondary);
}

.expand-icon {
  display: inline-block;
  margin-right: 8px;
  font-size: 10px;
  color: var(--text-secondary);
}

.album-track-row {
  grid-template-columns: 2fr 1.5fr 80px 140px;
  padding-left: 40px;
  background: var(--bg-tertiary);
  margin: 2px 0;
  border-radius: 0;
}

.album-track-row:hover {
  background: var(--bg-secondary);
}

.album-tracks {
  animation: slideDown 0.2s ease;
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

.track-artist {
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

  .album-track-row {
    grid-template-columns: 1fr auto;
    padding-left: 24px;
  }

  .col-duration {
    display: none;
  }
}
</style>
