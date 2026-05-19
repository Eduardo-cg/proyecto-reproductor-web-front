<template>
  <div class="library">
    <main class="container">
      <div class="header">
        <h1>{{ t('library.title') }}</h1>
        <div class="header-buttons">
          <button class="btn btn-primary" @click="showUpload = true">+ {{ t('library.addTrack') }}</button>
          <button class="btn btn-primary" @click="showAlbumUpload = true">+ {{ t('library.addAlbum') }}</button>
        </div>
      </div>

      <div class="search">
        <input v-model="search" type="text" :placeholder="t('library.searchPlaceholder')" />
      </div>

      <div v-if="loading" class="loading">{{ t('auth.loading') }}</div>

      <div v-else-if="filteredTracks.length === 0" class="empty">{{ t('library.noTracks') }}</div>

      <div v-else class="tracks-table">
        <div class="tracks-header">
          <div class="col-cover"></div>
          <div class="col-title">{{ t('library.trackTitle') }}</div>
          <div class="col-artist">{{ t('library.trackArtist') }}</div>
          <div class="col-album">{{ t('library.album') }}</div>
          <div class="col-duration">{{ t('library.duration') }}</div>
          <div class="col-actions"></div>
        </div>
        <div v-for="track in filteredTracks" :key="track.id" class="track-row">
          <div class="col-cover">
            <img v-if="track.cover" :src="track.cover" alt="Cover" class="track-cover" />
            <div v-else class="preview-cover-placeholder">&#127925;</div>
          </div>
          <div class="col-title track-title">{{ track.title }}</div>
          <div class="col-artist track-artist">{{ track.artist }}</div>
          <div class="col-album track-album">{{ track.album || '-' }}</div>
          <div class="col-duration track-duration">{{ formatDuration(track.duration) }}</div>
          <div class="col-actions track-actions">
            <button class="btn-play" @click="playTrack(track)" :title="t('player.play')">▶</button>
            <button class="btn-delete" @click="deleteTrack(track.id)" :title="t('library.delete')">&#128465;</button>
          </div>
        </div>
      </div>

      <UploadSongsModal v-model:showUpload="showUpload" @uploaded="loadTracks" />
      <UploadAlbumModal v-model:showUpload="showAlbumUpload" @uploaded="loadTracks" />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadAlbumModal from '../components/UploadAlbumModal.vue'
import UploadSongsModal from '../components/UploadSongsModal.vue'
import { api } from '../services/api'
import { usePlayerStore } from '../stores/playerStore'
import { formatDuration } from '../utils/format'

const { t } = useI18n()
const playerStore = usePlayerStore()

const tracks = ref([])
const loading = ref(true)
const search = ref('')
const showUpload = ref(false)
const showAlbumUpload = ref(false)

const filteredTracks = computed(() => {
  if (!search.value) return tracks.value
  const s = search.value.toLowerCase()
  return tracks.value.filter(t =>
    t.title.toLowerCase().includes(s) ||
    t.artist.toLowerCase().includes(s) ||
    (t.album && t.album.toLowerCase().includes(s))
  )
})

const loadTracks = async () => {
  try {
    tracks.value = await api.getTracks()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const playTrack = (track) => {
  if (playerStore.state.queue.length === 0 && !playerStore.state.currentTrack) {
    playerStore.playTrack(track)
  } else {
    playerStore.addToQueue(track)
  }
}

const deleteTrack = async (id) => {
  await api.deleteTrack(id)
  await loadTracks()
}

onMounted(loadTracks)
</script>

<style scoped>
.library {
  min-height: 100vh;
  padding-bottom: 120px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 30px 0;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.search {
  margin-bottom: 30px;
}

.tracks-table {
  display: flex;
  flex-direction: column;
}

.tracks-header {
  display: grid;
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 100px;
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
  grid-template-columns: 50px 2fr 1.5fr 1.5fr 80px 100px;
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

.btn-delete:hover {
  background: #e74c3c;
  color: white;
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
