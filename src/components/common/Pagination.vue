<template>
  <div
    v-if="totalPages > 0"
    class="pagination"
    role="navigation"
    aria-label="Paginación"
  >
    <div class="pagination-info">
      {{ currentPage * pageSize + 1 }}–{{ Math.min((currentPage + 1) * pageSize, totalElements) }} {{ t('pagination.of')
      }} {{ totalElements }}
    </div>
    <div class="pagination-controls">
      <select
        v-model.number="localPageSize"
        class="pagination-size-select"
        aria-label="Elementos por página"
        @change="onSizeChange"
      >
        <option :value="10">
          10
        </option>
        <option :value="20">
          20
        </option>
        <option :value="50">
          50
        </option>
        <option :value="100">
          100
        </option>
      </select>
      <button
        class="pagination-btn"
        :disabled="currentPage === 0"
        :aria-label="'Página anterior'"
        @click="$emit('page-change', currentPage - 1)"
      >
        <Icon
          name="chevron-left"
          size="14"
        />
      </button>
      <template
        v-for="(page, i) in pageNumbers"
        :key="i"
      >
        <span
          v-if="page < 0"
          class="pagination-ellipsis"
          aria-hidden="true"
        >…</span>
        <button
          v-else
          class="pagination-btn"
          :class="{ active: page === currentPage }"
          :aria-label="'Ir a página ' + (page + 1)"
          :aria-current="page === currentPage ? 'page' : undefined"
          @click="$emit('page-change', page)"
        >
          {{ page + 1 }}
        </button>
      </template>
      <button
        class="pagination-btn"
        :disabled="currentPage >= totalPages - 1"
        :aria-label="'Página siguiente'"
        @click="$emit('page-change', currentPage + 1)"
      >
        <Icon
          name="chevron-right"
          size="14"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Icon from '../icons/Icon.vue';

const { t } = useI18n()

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalElements: number
  pageSize: number
}>()

const emit = defineEmits<{
  'page-change': [page: number]
  'page-size-change': [size: number]
}>()

const localPageSize = ref(props.pageSize)

watch(() => props.pageSize, (val) => {
  localPageSize.value = val
})

const onSizeChange = (): void => {
  emit('page-size-change', localPageSize.value)
}

const pageNumbers = computed(() => {
  const total = props.totalPages
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i)
  }
  const pages: number[] = [0]
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
  if (start > 1) pages.push(-1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 2) pages.push(-2)
  pages.push(total - 1)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--text-muted);
  font-size: 13px;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pagination-size-select {
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--accent-alpha);
  color: var(--accent);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: default;
}

.pagination-btn.active {
  background: var(--accent);
  color: var(--bg-primary);
}

.pagination-ellipsis {
  color: var(--text-muted);
  font-size: 13px;
  padding: 0 4px;
}

@media (max-width: 768px) {
  .pagination {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .pagination-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 6px;
    font-size: 12px;
  }
}
</style>
