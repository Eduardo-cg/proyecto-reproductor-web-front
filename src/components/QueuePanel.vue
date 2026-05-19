<template>
  <div class="queue-panel">
    <div class="queue-header">
      <h3>Cola de reproducción</h3>
      <button class="close-btn" @click="$emit('close')">✕</button>
    </div>
    <div class="queue-list">
      <div v-if="queue.length === 0" class="empty-queue">
        No hay canciones en la cola
      </div>
      <div v-for="(track, index) in queue" :key="index" class="queue-item">
        <img v-if="track.cover" :src="track.cover" alt="Cover" class="item-cover" />
        <div v-else class="item-cover-placeholder">🎵</div>
        <div class="item-info">
          <div class="item-title">{{ track.title }}</div>
          <div class="item-artist">{{ track.artist }}</div>
        </div>
        <button class="remove-btn" @click="$emit('remove', index)">✕</button>
      </div>
    </div>
    <div v-if="queue.length > 0" class="queue-footer">
      <button class="clear-btn" @click="$emit('clear')">Vaciar cola</button>
    </div>
  </div>
</template>

<script setup>
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
  bottom: 90px;
  left: 250px;
  right: 0;
  height: 300px;
  background: var(--bg-secondary);
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
  padding: 16px 20px;
  border-bottom: 1px solid var(--border);
}

.queue-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
}

.close-btn:hover {
  color: var(--text-primary);
}

.queue-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.empty-queue {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px;
  transition: background 0.15s;
}

.queue-item:hover {
  background: var(--bg-tertiary);
}

.item-cover {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.item-cover-placeholder {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
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
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px 8px;
  opacity: 0;
  transition: opacity 0.15s;
}

.queue-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--text-primary);
}

.queue-footer {
  padding: 12px 20px;
  border-top: 1px solid var(--border);
}

.clear-btn {
  background: var(--bg-tertiary);
  border: none;
  color: var(--text-primary);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}

.clear-btn:hover {
  background: var(--border);
}
</style>