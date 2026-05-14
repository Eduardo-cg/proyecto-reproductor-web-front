<template>
  <div class="playlist-page">

    <main class="container">
      <div v-if="playlistStore.state.loading" class="loading">Cargando...</div>
      
      <div v-else-if="playlistStore.state.currentPlaylist">
        <div class="playlist-header">
          <h1>{{ playlistStore.state.currentPlaylist.name }}</h1>
          <p>{{ playlistStore.state.currentPlaylist.tracks?.length || 0 }} canciones</p>
        </div>

        <div class="tracks">
          <div 
            v-for="(track, index) in playlistStore.state.currentPlaylist.tracks" 
            :key="track.id" 
            class="track-item"
          >
            <span class="track-number">{{ index + 1 }}</span>
            <img :src="track.cover || '/default-cover.png'" alt="Cover" class="track-cover" />
            <div class="track-info">
              <div class="track-title">{{ track.title }}</div>
              <div class="track-artist">{{ track.artist }}</div>
            </div>
            <div class="track-actions">
              <button @click="playTrack(track)">▶</button>
              <button @click="removeTrack(track.id)">🗑</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty">
        <p>Playlist no encontrada</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '../stores/playerStore'
import { usePlaylistStore } from '../stores/playlistStore'
import NavBar from '../components/NavBar.vue'

const route = useRoute()
const playerStore = usePlayerStore()
const playlistStore = usePlaylistStore()

const playTrack = (track) => {
  playerStore.playTrack(track)
}

const removeTrack = async (trackId) => {
  await playlistStore.removeTrack(route.params.id, trackId)
}

onMounted(() => {
  playlistStore.fetchPlaylist(route.params.id)
})
</script>

<style scoped>
.playlist-page {
  min-height: 100vh;
  padding-bottom: 120px;
}

.playlist-header {
  margin: 30px 0;
}

.playlist-header h1 {
  margin-bottom: 10px;
}

.playlist-header p {
  color: var(--text-secondary);
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

.track-number {
  width: 30px;
  color: var(--text-secondary);
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

.empty {
  text-align: center;
  padding: 50px;
  color: var(--text-secondary);
}

.loading {
  text-align: center;
  padding: 50px;
}
</style>