<template>
  <div class="player-bar">

    <div class="track-info">
      <div v-if="playerStore.state.currentTrack" class="track-details">
        <img v-if="playerStore.state.currentTrack.cover" :src="playerStore.state.currentTrack.cover" alt="Cover"
          class="cover" />
        <div v-else class="preview-cover-placeholder">&#127925;</div>
        <div class="track-text">
          <div class="track-title">{{ playerStore.state.currentTrack.title }}</div>
          <div class="track-artist">{{ playerStore.state.currentTrack.artist }}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="controls-buttons">
        <button class="btn-control" @click="playerStore.playPrevious()">⏮</button>
        <button class="btn-play" @click="playerStore.togglePlay()">
          {{ playerStore.state.isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="btn-control" @click="playerStore.playNext()">⏭</button>
      </div>
      <div class="progress-container">
        <span class="time">{{ formatDuration(playerStore.state.position) }}</span>
        <input type="range" :value="playerStore.state.position" :max="playerStore.state.duration || 0" @input="onSeek"
          class="progress-bar" />
        <span class="time">{{ formatDuration(playerStore.state.duration) }}</span>
      </div>
    </div>

    <button class="btn-control" :class="{ active: showQueue }" @click="showQueue = !showQueue">☰</button>

    <div class="volume">
      <span @click="playerStore.mute()">{{ playerStore.state.volume === 0 ? '🔇' : '🔊' }}</span>
      <input type="range" :value="playerStore.state.volume" max="1" step="0.01" @input="onVolumeChange"
        class="volume-bar" />
    </div>

    <router-link to="/settings" class="btn-control settings-btn" :title="t('settings.title')">⚙️</router-link>
  </div>

  <QueuePanel v-if="showQueue" :queue="playerStore.state.queue" @close="showQueue = false"
    @remove="playerStore.removeFromQueue" @clear="playerStore.clearQueue" />
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../stores/playerStore'
import { formatDuration } from '../utils/format'
import QueuePanel from './QueuePanel.vue'

const { t } = useI18n()
const playerStore = usePlayerStore()
const showQueue = ref(false)

const onSeek = (e) => {
  playerStore.seek(parseFloat(e.target.value))
}

const onVolumeChange = (e) => {
  playerStore.setVolume(parseFloat(e.target.value))
}
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 100;
}

.track-info {
  width: 200px;
}

.track-details {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.track-title {
  font-weight: 600;
  font-size: 14px;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 60%;
  margin: 0 auto;
}

.controls-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-control {
  background: none;
  font-size: 20px;
  color: var(--text-primary);
  padding: 4px;
}

.btn-control.active {
  color: var(--accent);
}

.btn-play {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--text-primary);
  color: var(--bg-primary);
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
}

.progress-bar,
.volume-bar {
  -webkit-appearance: none;
  height: 4px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  cursor: pointer;
}

.progress-bar::-webkit-slider-thumb,
.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-primary);
}

.volume {
  width: 150px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-bar {
  width: 100px;
}
</style>