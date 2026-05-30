<template>
  <div class="player-bar" role="region" :aria-label="t('player.player')">
    <div class="track-info">
      <div v-if="playerStore.state.currentTrack" class="track-info">
        <img v-if="playerStore.state.currentTrack.cover" :src="playerStore.state.currentTrack.cover" alt="Cover"
          class="cover" />
        <div v-else class="cover-placeholder" aria-hidden="true">
          <Icon name="music" size="20" />
        </div>
        <div class="track-text">
          <div class="track-title">{{ playerStore.state.currentTrack.title }}</div>
          <div class="track-artist">{{ playerStore.state.currentTrack.artist }}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="controls-buttons">
        <button class="btn-control" @click="playerStore.playPrevious()" :aria-label="t('player.previous')">
          <Icon name="prev" size="18" />
        </button>
        <button class="btn-play" @click="playerStore.togglePlay()"
          :aria-label="playerStore.state.isPlaying ? t('player.pause') : t('player.play')">
          <Icon :name="playerStore.state.isPlaying ? 'pause' : 'play'" size="18" />
        </button>
        <button class="btn-control" @click="playerStore.playNext()" :aria-label="t('player.next')">
          <Icon name="next" size="18" />
        </button>
      </div>
      <div class="progress-container">
        <span class="time" aria-hidden="true">{{ formatDuration(isSeeking ? seekTemp : playerStore.state.position)
          }}</span>
        <div class="progress-wrapper" ref="progressContainer">
          <input class="progress-bar" type="range" :value="isSeeking ? seekTemp : playerStore.state.position"
            :max="playerStore.state.duration || 0" @mousedown.prevent="onProgressMouseDown"
            :aria-label="t('player.progress', { current: formatDuration(isSeeking ? seekTemp : playerStore.state.position), total: formatDuration(playerStore.state.duration) })" />
          <div v-if="isSeeking" class="seek-tooltip" :style="tooltipStyle">
            {{ formatDuration(seekTemp) }}
          </div>
        </div>
        <span class="time" aria-hidden="true">{{ formatDuration(playerStore.state.duration) }}</span>
      </div>
    </div>

    <div class="right-controls">
      <button class="btn-control btn-icon-only" :class="{ active: showQueue }" @click="showQueue = !showQueue"
        :aria-label="t('player.showQueue')" :aria-expanded="showQueue">
        <Icon name="queue" size="20" />
      </button>

      <div class="volume" role="group" :aria-label="t('player.volumeControl')">
        <button class="btn-control btn-icon-only" @click="playerStore.mute()"
          :aria-label="playerStore.state.volume === 0 ? t('player.unmute') : t('player.mute')">
          <Icon :name="playerStore.state.volume === 0 ? 'volume-mute' : 'volume'" size="20" />
        </button>
        <input type="range" :value="playerStore.state.volume" max="1" step="0.01" @input="onVolumeChange"
          class="volume-bar" :aria-label="t('player.volume')" />
      </div>

      <router-link to="/settings" class="btn-control btn-icon-only settings-btn" :title="t('settings.title')"
        :aria-label="t('settings.title')">
        <Icon name="settings" size="20" />
      </router-link>
    </div>
  </div>

  <QueuePanel v-if="showQueue" :queue="playerStore.state.queue" @close="showQueue = false"
    @remove="playerStore.removeFromQueue" @clear="playerStore.clearQueue" @reorder="playerStore.reorderQueue"
    @play="playerStore.playFromQueue" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePlayerStore } from '../../stores/playerStore'
import { formatDuration } from '../../utils/utils'
import Icon from '../icons/Icon.vue'
import QueuePanel from './QueuePanel.vue'

const { t } = useI18n()
const playerStore = usePlayerStore()
const showQueue = ref(false)

const seekTemp = ref(0)
const isSeeking = ref(false)
const tooltipX = ref(0)
const progressContainer = ref<HTMLElement | null>(null)

const tooltipStyle = computed(() => ({
  left: `${tooltipX.value}px`,
  transform: 'translateX(-50%)'
}))

const calculateTimeFromEvent = (e: MouseEvent): number => {
  if (!progressContainer.value) return 0
  const input = progressContainer.value.querySelector('input[type="range"]') as HTMLInputElement | null
  if (!input) return 0
  const inputRect = input.getBoundingClientRect()
  const x = e.clientX - inputRect.left
  const percentage = Math.max(0, Math.min(1, x / inputRect.width))
  return percentage * (playerStore.state.duration || 0)
}

const THUMB_RADIUS = 6

const clampTooltipX = (x: number): number => {
  const rect = progressContainer.value?.getBoundingClientRect()
  if (!rect) return x
  return Math.max(THUMB_RADIUS, Math.min(rect.width - THUMB_RADIUS, x))
}

const onProgressMouseDown = (e: MouseEvent) => {
  isSeeking.value = true
  seekTemp.value = calculateTimeFromEvent(e)
  const rect = progressContainer.value?.getBoundingClientRect()
  tooltipX.value = clampTooltipX(e.clientX - (rect?.left || 0))
  document.addEventListener('mousemove', onProgressMouseMove)
  document.addEventListener('mouseup', onProgressMouseUp)
}

const onProgressMouseMove = (e: MouseEvent) => {
  if (!isSeeking.value) return
  seekTemp.value = calculateTimeFromEvent(e)
  const rect = progressContainer.value?.getBoundingClientRect()
  tooltipX.value = clampTooltipX(e.clientX - (rect?.left || 0))
}

const onProgressMouseUp = () => {
  if (isSeeking.value) {
    playerStore.seek(seekTemp.value)
    isSeeking.value = false
  }
  document.removeEventListener('mousemove', onProgressMouseMove)
  document.removeEventListener('mouseup', onProgressMouseUp)
}

const onVolumeChange = (e: Event) => {
  playerStore.setVolume(parseFloat((e.target as HTMLInputElement).value))
}
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--player-height);
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  align-items: center;
  padding: 0 16px;
  z-index: 100;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cover {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.cover-placeholder {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.track-text {
  min-width: 0;
}

.track-title {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-control.active {
  color: var(--accent);
}

.btn-icon-only {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
}

.btn-icon-only:hover {
  background: var(--accent-alpha);
}

.btn-play {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--accent);
  color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity var(--transition);
}

.btn-play:hover {
  opacity: 0.85;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  cursor: pointer;
}

.progress-wrapper {
  flex: 1;
  position: relative;
  height: 20px;
  display: flex;
  align-items: center;
}

.seek-tooltip {
  position: absolute;
  top: -28px;
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  pointer-events: none;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.time {
  font-size: 12px;
  color: var(--text-muted);
  min-width: 40px;
  font-variant-numeric: tabular-nums;
}

.progress-bar {
  width: 100%;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 2px;
  background: var(--bg-tertiary);
  cursor: pointer;
  outline: none;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.progress-bar:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  justify-self: end;
}

.volume {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.volume-bar {
  width: 100px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  border-radius: 2px;
  background: var(--bg-tertiary);
  cursor: pointer;
  outline: none;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  cursor: pointer;
}

.volume-bar:focus-visible {
  outline: 1px solid var(--accent);
  outline-offset: 2px;
}

@media (max-width: 768px) {
  .volume {
    display: none;
  }

  .track-info {
    width: 140px;
  }
}

@media (max-width: 480px) {
  .player-bar {
    padding: 0 8px;
  }

  .track-info {
    width: auto;
    max-width: 100px;
    gap: 6px;
  }

  .cover,
  .cover-placeholder {
    width: 40px;
    height: 40px;
  }

  .track-title {
    font-size: 12px;
  }

  .track-artist {
    display: none;
  }

  .controls-buttons {
    gap: 6px;
  }

  .btn-control {
    padding: 2px;
  }

  .btn-icon-only {
    width: 36px;
    height: 36px;
  }

  .btn-play {
    width: 34px;
    height: 34px;
  }

  .time {
    min-width: 32px;
    font-size: 10px;
  }

  .progress-container {
    gap: 4px;
  }
}
</style>
