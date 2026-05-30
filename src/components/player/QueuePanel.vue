<template>
  <div class="queue-panel" :style="panelStyle" role="dialog" aria-label="Cola de reproducción">
    <div class="queue-header" @mousedown="startResize">
      <h3>Cola de reproducción</h3>
      <button class="close-btn" @click="$emit('close')" aria-label="Cerrar cola">
        <Icon name="close" size="18" />
      </button>
    </div>
    <div class="queue-list" ref="queueListRef">
      <div v-if="queue.length === 0" class="empty-queue">
        <Icon name="queue" size="32" />
        <p>No hay canciones en la cola</p>
      </div>
      <div v-for="(track, index) in queue" :key="track.id ?? index" class="queue-item" :data-index="index">
        <button class="drag-handle" aria-label="Reordenar" tabindex="0">
          <Icon name="drag" size="14" />
        </button>
        <button class="play-btn" @click.stop="$emit('play', index)" :aria-label="'Reproducir ' + track.title"
          tabindex="0">
          <Icon name="play" size="14" />
        </button>
        <img v-if="track.cover" :src="track.cover" alt="" class="item-cover" />
        <div v-else class="item-cover-placeholder" aria-hidden="true">
          <Icon name="music" size="18" />
        </div>
        <div class="item-info">
          <div class="item-title">{{ track.title }}</div>
          <div class="item-artist">{{ track.artist }}</div>
        </div>
        <button class="remove-btn" @click="$emit('remove', index)" :aria-label="'Eliminar ' + track.title">
          <Icon name="close" size="14" />
        </button>
      </div>
    </div>
    <div v-if="queue.length > 0" class="queue-footer">
      <button class="clear-btn" @click="$emit('clear')">Vaciar cola</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { TrackDTO } from '../../types';
import Icon from '../icons/Icon.vue';

const props = withDefaults(defineProps<{
  queue?: TrackDTO[]
}>(), {
  queue: () => []
})

const emit = defineEmits<{
  'close': []
  'remove': [index: number]
  'clear': []
  'reorder': [newQueue: TrackDTO[]]
  'play': [index: number]
}>()

const panelHeight = ref(300)
const isResizing = ref(false)
const resizeStartY = ref(0)
const resizeStartHeight = ref(300)

const panelStyle = computed(() => {
  if (window.innerWidth <= 480) return {}
  return { height: panelHeight.value + 'px' }
})

const startResize = (e: MouseEvent) => {
  if (window.innerWidth <= 480) return
  isResizing.value = true
  resizeStartY.value = e.clientY
  resizeStartHeight.value = panelHeight.value
  document.addEventListener('mousemove', onResize)
  document.addEventListener('mouseup', stopResize)
}

const onResize = (e: MouseEvent) => {
  if (!isResizing.value) return
  const playerHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--player-height')) || 90
  const maxHeight = window.innerHeight - playerHeight - 16
  const newHeight = resizeStartHeight.value - (e.clientY - resizeStartY.value)
  panelHeight.value = Math.max(120, Math.min(maxHeight, newHeight))
}

const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', onResize)
  document.removeEventListener('mouseup', stopResize)
}

const queueListRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const initSortable = () => {
  if (!queueListRef.value || props.queue.length < 2) return
  sortableInstance = Sortable.create(queueListRef.value, {
    animation: 150,
    handle: '.drag-handle',
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: (evt) => {
      if (evt.oldIndex === evt.newIndex) return
      const reordered = [...props.queue]
      const [moved] = reordered.splice(evt.oldIndex!, 1)
      reordered.splice(evt.newIndex!, 0, moved)
      emit('reorder', reordered)
    }
  })
}

onMounted(() => {
  initSortable()
})

onBeforeUnmount(() => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
})
</script>

<style scoped>
.queue-panel {
  position: fixed;
  bottom: var(--player-height);
  left: 0;
  right: 0;
  height: 300px;
  background: var(--bg-primary);
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  z-index: 99;
  animation: slideUp 0.2s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

.queue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  cursor: row-resize;
  user-select: none;
}

.queue-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
}

.close-btn:hover {
  background: var(--accent-alpha);
  color: var(--text-primary);
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.empty-queue {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: var(--text-muted);
  gap: 8px;
}

.empty-queue p {
  font-size: 14px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  transition: background 0.1s;
}

.queue-item:hover {
  background: var(--bg-secondary);
}

.item-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  flex-shrink: 0;
}

.item-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-artist {
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  opacity: 0;
  transition: opacity 0.1s;
}

.queue-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--accent-alpha);
  color: var(--text-primary);
}

.play-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--accent);
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.play-btn:hover {
  background: var(--accent-alpha);
  color: var(--accent);
}

.drag-handle {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: grab;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.1s;
}

.queue-item:hover .drag-handle,
.queue-item:hover .play-btn {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.sortable-ghost {
  opacity: 0.3;
  background: var(--accent-alpha);
}

.sortable-drag {
  opacity: 0.8;
}

.sortable-ghost .drag-handle,
.sortable-drag .drag-handle,
.sortable-ghost .play-btn,
.sortable-drag .play-btn {
  opacity: 1;
}

.queue-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border);
}

.clear-btn {
  padding: 8px 16px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  transition: background 0.1s;
}

.clear-btn:hover {
  background: var(--accent-alpha);
}

@media (max-width: 480px) {
  .queue-panel {
    height: 100%;
    bottom: var(--player-height);
  }

  .queue-header {
    cursor: default;
  }

  .drag-handle,
  .play-btn {
    opacity: 1;
  }

  .remove-btn {
    opacity: 1;
  }
}
</style>
