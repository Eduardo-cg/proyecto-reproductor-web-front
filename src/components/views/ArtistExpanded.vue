<template>
  <div class="artist-expanded" role="region">
    <div v-if="loading" class="loading">{{ t('auth.loading') }}</div>
    <template v-else>
      <div v-if="tracks.length > 0" class="expanded-section">
        <h4 class="expanded-title">{{ t('library.artistTracks') }}</h4>
        <div class="expanded-table">
          <div v-for="track in tracks" :key="track.id" class="expanded-row" @click="playTrack(track)">
            <span class="expanded-col-title">{{ track.title }}</span>
            <span class="expanded-col-duration">{{ formatDuration(track.duration) }}</span>
          </div>
        </div>
        <div v-if="trackTotalPages > 1" class="expanded-pagination">
          <button class="page-btn" :disabled="trackPage === 0" @click="goToTrackPage(trackPage - 1)">
            <Icon name="chevron-left" size="12" />
          </button>
          <span class="page-info">{{ trackPage + 1 }} / {{ trackTotalPages }}</span>
          <button class="page-btn" :disabled="trackPage >= trackTotalPages - 1" @click="goToTrackPage(trackPage + 1)">
            <Icon name="chevron-right" size="12" />
          </button>
        </div>
      </div>
      <div v-if="albums.length > 0" class="expanded-section">
        <h4 class="expanded-title">{{ t('library.artistAlbums') }}</h4>
        <div class="expanded-table">
          <div v-for="alb in albums" :key="alb.id" class="expanded-row" @click="playAlbum(alb)">
            <span class="expanded-col-title">{{ alb.title }}</span>
            <span class="expanded-col-duration">{{ t('library.albumCount', { count: alb.trackCount }) }}</span>
          </div>
        </div>
        <div v-if="albumTotalPages > 1" class="expanded-pagination">
          <button class="page-btn" :disabled="albumPage === 0" @click="goToAlbumPage(albumPage - 1)">
            <Icon name="chevron-left" size="12" />
          </button>
          <span class="page-info">{{ albumPage + 1 }} / {{ albumTotalPages }}</span>
          <button class="page-btn" :disabled="albumPage >= albumTotalPages - 1" @click="goToAlbumPage(albumPage + 1)">
            <Icon name="chevron-right" size="12" />
          </button>
        </div>
      </div>
      <div v-if="tracks.length === 0 && albums.length === 0" class="empty-sub">
        <p>{{ t('library.noContent') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api'
import { usePlayerStore } from '../../stores/playerStore'
import { formatDuration } from '../../utils/utils.js'
import Icon from '../icons/Icon.vue'

const props = defineProps({
  artistId: { type: Number, required: true }
})

const { t } = useI18n()
const playerStore = usePlayerStore()

const loading = ref(true)
const tracks = ref([])
const albums = ref([])
const trackPage = ref(0)
const trackPageSize = ref(10)
const albumPage = ref(0)
const albumPageSize = ref(10)
const trackTotalPages = ref(0)
const albumTotalPages = ref(0)

const fetchTrackPage = async (artistId, page) => {
  const data = await api.getArtistTracks(artistId, page, trackPageSize.value)
  tracks.value = data.tracks || []
  trackTotalPages.value = data.totalPages || 0
}

const fetchAlbumPage = async (artistId, page) => {
  const data = await api.getArtistAlbums(artistId, page, albumPageSize.value)
  albums.value = data.albums || []
  albumTotalPages.value = data.totalPages || 0
}

const goToTrackPage = async (page) => {
  trackPage.value = page
  await fetchTrackPage(props.artistId, page)
}

const goToAlbumPage = async (page) => {
  albumPage.value = page
  await fetchAlbumPage(props.artistId, page)
}

const playTrack = async (track) => {
  playerStore.clearQueue()
  playerStore.playTrack(track)
  const data = await api.getArtistTracks(props.artistId, 0, 9999)
  const allTracks = data.tracks || []
  const index = allTracks.findIndex(t => t.id === track.id)
  if (index !== -1) {
    allTracks.slice(index + 1).forEach(t => playerStore.addToQueue(t))
  }
}

const playAlbum = async (album) => {
  const data = await api.getAlbum(album.id)
  const tracks = data.tracks || []
  if (tracks.length === 0) return
  playerStore.clearQueue()
  playerStore.playTrack(tracks[0])
  tracks.slice(1).forEach(t => playerStore.addToQueue(t))
}

watch(() => props.artistId, async (newId) => {
  trackPage.value = 0
  albumPage.value = 0
  tracks.value = []
  albums.value = []
  trackTotalPages.value = 0
  albumTotalPages.value = 0
  loading.value = true
  try {
    await Promise.all([
      fetchTrackPage(newId, 0),
      fetchAlbumPage(newId, 0)
    ])
  } catch (e) {
    console.error(e)
    tracks.value = []
    albums.value = []
    trackTotalPages.value = 0
    albumTotalPages.value = 0
  } finally {
    loading.value = false
  }
}, { immediate: true })
</script>

<style scoped>
.artist-expanded {
  margin-top: 4px;
  animation: slideDown 0.15s ease;
}

.expanded-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  margin-bottom: 6px;
  overflow: hidden;
}

.expanded-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  padding: 8px 12px;
  margin: 0;
  border-bottom: 1px solid var(--border);
}

.expanded-table {
  display: flex;
  flex-direction: column;
}

.expanded-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.1s;
}

.expanded-row:hover {
  background: var(--bg-tertiary);
}

.expanded-col-title {
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.expanded-col-duration {
  color: var(--text-muted);
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 12px;
}

.expanded-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid var(--border);
}

.page-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.page-btn:hover:not(:disabled) {
  background: var(--accent-alpha);
  color: var(--accent);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.page-info {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 48px;
  text-align: center;
}
</style>
