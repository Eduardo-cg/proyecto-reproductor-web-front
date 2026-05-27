<template>
  <div class="queue-panel" role="dialog" aria-label="Cola de reproducción">
    <div class="queue-header">
      <h3>Cola de reproducción</h3>
      <button class="close-btn" @click="$emit('close')" aria-label="Cerrar cola">
        <Icon name="close" size="18" />
      </button>
    </div>
    <div class="queue-list">
      <div v-if="queue.length === 0" class="empty-queue">
        <Icon name="queue" size="32" />
        <p>No hay canciones en la cola</p>
      </div>
      <div v-for="(track, index) in queue" :key="index" class="queue-item">
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

<script setup>
import Icon from '../icons/Icon.vue'

defineProps({
  queue: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close', 'remove', 'clear'])
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

  .remove-btn {
    opacity: 1;
  }
}
</style>
