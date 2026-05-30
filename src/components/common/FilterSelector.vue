<template>
  <div class="filter-selector" :class="{ open: isOpen }">
    <div class="selector-trigger" @click="toggleDropdown" role="combobox" :aria-expanded="isOpen"
      :aria-label="placeholder" tabindex="0" @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown">
      <div class="selector-display">
        <template v-if="selectedIds.length === 0">
          <span class="placeholder">{{ placeholder }}</span>
        </template>
        <template v-else>
          <span class="selected-text">{{ selectedIds.length }} seleccionado{{ selectedIds.length !== 1 ? 's' : ''
            }}</span>
        </template>
      </div>
      <div class="selector-actions">
        <Icon name="chevron-down" size="12" class="dropdown-arrow" :class="{ rotated: isOpen }" />
      </div>
    </div>

    <div v-if="isOpen" class="selector-dropdown" @click.stop role="listbox" :aria-label="placeholder">
      <div class="dropdown-search">
        <div class="search-wrapper">
          <Icon name="search" size="14" class="search-icon-inline" />
          <input v-model="searchQuery" type="text" :placeholder="t('library.search')" class="search-input"
            ref="searchInput" :aria-label="t('library.search')" />
        </div>
      </div>

      <div class="options-list">
        <div v-if="filteredOptions.length === 0 && !loading" class="empty-state">
          {{ t('library.noResults') }}
        </div>
        <div v-else-if="loading" class="loading-state">
          {{ t('auth.loading') }}
        </div>
        <div v-for="option in filteredOptions" :key="option.id" class="option-item"
          :class="{ selected: isSelected(option.id) }" @click="toggleOption(option)" role="option"
          :aria-selected="isSelected(option.id)">
          <div class="option-checkbox" :class="{ checked: isSelected(option.id) }">
            <Icon v-if="isSelected(option.id)" name="check" size="12" />
          </div>

          <span class="option-label">{{ option.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  options: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  loading: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'open'])

const isOpen = ref(false)
const searchQuery = ref('')
const searchInput = ref(null)

const selectedIds = computed(() => props.modelValue || [])

const filteredOptions = computed(() => {
  let opts = props.options
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    opts = opts.filter(o => o.label.toLowerCase().includes(q))
  }
  return opts
})

const isSelected = (id) => selectedIds.value.includes(id)

const toggleOption = (option) => {
  const current = [...selectedIds.value]
  const index = current.indexOf(option.id)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(option.id)
  }
  emit('update:modelValue', current)
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    emit('open')
    searchQuery.value = ''
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const closeDropdown = () => {
  isOpen.value = false
}

defineExpose({ closeDropdown })

const handleClickOutside = (e) => {
  if (isOpen.value && !e.target.closest('.filter-selector')) {
    isOpen.value = false
  }
}

watch(isOpen, (open) => {
  if (!open) {
    searchQuery.value = ''
  }
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.filter-selector {
  position: relative;
  min-width: 180px;
  width: 100%;
}

.selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 36px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: border-color 0.15s;
}

.selector-trigger:hover {
  border-color: var(--accent);
}

.open .selector-trigger {
  border-color: var(--accent);
}

.selector-display {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.placeholder,
.selected-text {
  color: var(--text-muted);
  font-size: 13px;
}

.selector-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.selector-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  z-index: 100;
  max-height: 280px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

@media (max-width: 480px) {
  .filter-selector {
    min-width: 140px;
  }
}
</style>