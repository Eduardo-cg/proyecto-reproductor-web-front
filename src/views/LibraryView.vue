<template>
  <div class="library">

    <main class="container">
      <div class="header">
        <h1>{{ t('library.title') }}</h1>
        <button class="btn btn-primary" @click="showUpload = true">+ {{ t('library.addTrack') }}</button>
      </div>

      <div class="search">
        <input v-model="search" type="text" :placeholder="t('library.searchPlaceholder')" />
      </div>

      <div v-if="loading" class="loading">{{ t('auth.loading') }}</div>

      <div v-else-if="filteredTracks.length === 0" class="empty">{{ t('library.noTracks') }}</div>

      <div v-else class="tracks">
        <div v-for="track in filteredTracks" :key="track.id" class="track-item">
          <img :src="track.cover || '/default-cover.png'" alt="Cover" class="track-cover" />
          <div class="track-info">
            <div class="track-title">{{ track.title }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
          <div class="track-actions">
            <button @click="playTrack(track)">▶</button>
            <button @click="deleteTrack(track.id)">🗑</button>
          </div>
        </div>
      </div>

      <div v-if="showUpload" class="modal">
        <div class="modal-content">
          <h3>{{ t('library.addTrack') }}</h3>
          <form @submit.prevent="addTrack">
            <input v-model="newTrack.title" :placeholder="t('library.trackTitle')" required />
            <input v-model="newTrack.artist" :placeholder="t('library.trackArtist')" required />
            <input v-model="newTrack.url" :placeholder="t('library.trackUrl')" required />
            <input v-model="newTrack.cover" :placeholder="t('library.trackCover')" />
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="showUpload = false">{{ t('library.cancel') }}</button>
              <button type="submit" class="btn btn-primary">{{ t('library.add') }}</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../stores/playerStore'
import { api } from '../services/api'

const { t } = useI18n()
const playerStore = usePlayerStore()

const tracks = ref([])
const loading = ref(true)
const search = ref('')
const showUpload = ref(false)
const newTrack = ref({ title: '', artist: '', url: '', cover: '' })

const filteredTracks = computed(() => {
  if (!search.value) return tracks.value
  const s = search.value.toLowerCase()
  return tracks.value.filter(t => 
    t.title.toLowerCase().includes(s) || 
    t.artist.toLowerCase().includes(s)
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
  playerStore.playTrack(track)
}

const addTrack = async () => {
  await api.createTrack(newTrack.value)
  showUpload.value = false
  newTrack.value = { title: '', artist: '', url: '', cover: '' }
  await loadTracks()
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

.search {
  margin-bottom: 30px;
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
}

.track-cover {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.track-info {
  flex: 1;
}

.track-title {
  font-weight: 600;
}

.track-artist {
  font-size: 14px;
  color: var(--text-secondary);
}

.track-actions {
  display: flex;
  gap: 10px;
}

.track-actions button {
  background: var(--bg-tertiary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  font-size: 16px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-content {
  background: var(--bg-secondary);
  padding: 30px;
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 400px;
}

.modal-content h3 {
  margin-bottom: 20px;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}
</style>