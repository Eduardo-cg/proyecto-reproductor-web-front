<template>
  <div v-if="totalPages > 0" class="pagination">
    <div class="pagination-info">
      {{ currentPage * pageSize + 1 }}–{{ Math.min((currentPage + 1) * pageSize, totalElements) }} {{ t('pagination.of') }} {{ totalElements }}
    </div>
    <div class="pagination-controls">
      <select v-model.number="localPageSize" class="pagination-size-select" @change="onSizeChange">
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
        <option :value="100">100</option>
      </select>
      <button class="pagination-btn" :disabled="currentPage === 0" @click="$emit('page-change', currentPage - 1)">{{ t('pagination.prev') }}</button>
      <template v-for="(page, i) in pageNumbers" :key="i">
        <span v-if="page === '...'" class="pagination-ellipsis">...</span>
        <button v-else class="pagination-btn" :class="{ active: page === currentPage }" @click="$emit('page-change', page)">{{ page + 1 }}</button>
      </template>
      <button class="pagination-btn" :disabled="currentPage >= totalPages - 1" @click="$emit('page-change', currentPage + 1)">{{ t('pagination.next') }}</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalElements: { type: Number, required: true },
  pageSize: { type: Number, required: true }
})

const emit = defineEmits(['page-change', 'page-size-change'])

const localPageSize = ref(props.pageSize)

watch(() => props.pageSize, (val) => {
  localPageSize.value = val
})

const onSizeChange = () => {
  emit('page-size-change', localPageSize.value)
}

const pageNumbers = computed(() => {
  const total = props.totalPages
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i)
  }
  const pages = [0]
  let start = Math.max(1, props.currentPage - 2)
  let end = Math.min(total - 2, props.currentPage + 2)
  if (props.currentPage < 4) {
    start = 1
    end = 4
  }
  if (props.currentPage > total - 5) {
    start = total - 5
    end = total - 2
  }
  if (start > 1) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 2) pages.push('...')
  pages.push(total - 1)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 15px 0;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--text-secondary);
  font-size: 14px;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-size-select {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
}

.per-page-label {
  color: var(--text-secondary);
  font-size: 13px;
  margin-right: 4px;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent);
  color: white;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.pagination-btn.active {
  background: var(--accent);
  color: white;
}

.pagination-ellipsis {
  color: var(--text-muted);
  font-size: 14px;
  padding: 0 4px;
}
</style>
