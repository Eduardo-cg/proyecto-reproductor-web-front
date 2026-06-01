<template>
  <div
    v-if="storageData"
    class="storage-bar-inner"
  >
    <div class="storage-bar-track">
      <div
        class="storage-bar-fill"
        :style="{ width: storagePercent + '%' }"
        :class="storageBarClass"
      />
    </div>
    <div class="storage-info">
      <span class="storage-used">{{ formatFileSize(storageData.usedBytes) }}</span>
      <span class="storage-separator"> / </span>
      <span class="storage-limit">{{ formatFileSize(storageData.limitBytes) }}</span>
    </div>
    <div class="storage-remaining">
      {{ formatFileSize(storageData.availableBytes) }} {{ t('settings.storageRemaining') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StorageUsage } from '../../types'
import { formatFileSize } from '../../utils/utils'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  storageData?: StorageUsage | null
}>(), {
  storageData: null
})

const storagePercent = computed(() => {
  if (!props.storageData || !props.storageData.limitBytes || props.storageData.limitBytes <= 0) return 0
  return Math.min(100, (props.storageData.usedBytes / props.storageData.limitBytes) * 100)
})

const storageBarClass = computed(() => {
  const pct = storagePercent.value
  if (pct >= 90) return 'storage-critical'
  if (pct >= 70) return 'storage-warning'
  return 'storage-normal'
})
</script>

<style scoped>
.storage-bar-inner {
  width: 100%;
}

.storage-bar-track {
  width: 100%;
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.storage-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.storage-normal {
  background: var(--accent);
}

.storage-warning {
  background: #f39c12;
}

.storage-critical {
  background: var(--danger);
}

.storage-info {
  display: flex;
  align-items: baseline;
  justify-content: center;
  margin-top: 12px;
  font-size: 14px;
}

.storage-used {
  font-weight: 600;
  color: var(--text-primary);
}

.storage-separator {
  color: var(--text-muted);
}

.storage-limit {
  color: var(--text-secondary);
}

.storage-remaining {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  margin-top: 4px;
}
</style>
