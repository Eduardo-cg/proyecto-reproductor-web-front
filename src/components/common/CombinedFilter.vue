<template>
  <div class="combined-filter" :class="{ open: isOpen }">
    <div class="filter-trigger" @click="toggleDropdown" role="combobox" :aria-expanded="isOpen"
      :aria-label="t('library.filters')" tabindex="0" @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown">
      <div class="trigger-display">
        <template v-if="totalSelected === 0">
          <span class="placeholder">{{ t('library.filters') }}</span>
        </template>
        <template v-else>
          <span class="selected-text">{{ t('library.selectedCount', { count: totalSelected }) }}</span>
        </template>
      </div>
      <Icon name="chevron-down" size="12" class="dropdown-arrow" :class="{ rotated: isOpen }" />
    </div>

    <div v-if="isOpen" class="filter-dropdown" @click.stop>
      <div class="filter-tabs">
        <button class="tab-btn" :class="{ active: activeTab === 'artist' }" @click="switchTab('artist')">
          <Icon name="artist" size="14" />
          <span>{{ artistPlaceholder }}</span>
        </button>
        <button class="tab-btn" :class="{ active: activeTab === 'album' }" @click="switchTab('album')">
          <Icon name="album" size="14" />
          <span>{{ albumPlaceholder }}</span>
        </button>
      </div>

      <div class="dropdown-search">
        <div class="search-wrapper">
          <Icon name="search" size="14" class="search-icon-inline" />
          <input v-model="searchQuery" type="text" :placeholder="t('library.search')"
            class="search-input" ref="searchInput" :aria-label="t('library.search')" />
        </div>
      </div>

      <div class="options-list">
        <div v-if="filteredOptions.length === 0" class="empty-state">
          {{ t('library.noResults') }}
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()

const props = defineProps({
  artistIds: { type: Array, default: () => [] },
  albumIds: { type: Array, default: () => [] },
  artistOptions: { type: Array, default: () => [] },
  albumOptions: { type: Array, default: () => [] },
  artistPlaceholder: { type: String, default: '' },
  albumPlaceholder: { type: String, default: '' },
})

const emit = defineEmits(['update:artistIds', 'update:albumIds'])

const isOpen = ref(false)
const activeTab = ref('artist')
const searchQuery = ref('')
const searchInput = ref(null)

const totalSelected = computed(() => {
  return (props.artistIds?.length || 0) + (props.albumIds?.length || 0)
})

const currentOptions = computed(() => {
  return activeTab.value === 'artist' ? props.artistOptions : props.albumOptions
})

const filteredOptions = computed(() => {
  let opts = currentOptions.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    opts = opts.filter(o => o.label.toLowerCase().includes(q))
  }
  return opts
})

const isSelected = (id) => {
  const ids = activeTab.value === 'artist' ? (props.artistIds || []) : (props.albumIds || [])
  return ids.includes(id)
}

const toggleOption = (option) => {
  const current = activeTab.value === 'artist'
    ? [...(props.artistIds || [])]
    : [...(props.albumIds || [])]
  const index = current.indexOf(option.id)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(option.id)
  }
  const event = activeTab.value === 'artist' ? 'update:artistIds' : 'update:albumIds'
  emit(event, current)
}

const switchTab = (tab) => {
  activeTab.value = tab
  searchQuery.value = ''
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    searchQuery.value = ''
    if ((props.albumIds?.length || 0) > 0 && (props.artistIds?.length || 0) === 0) {
      activeTab.value = 'album'
    } else {
      activeTab.value = 'artist'
    }
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
  if (isOpen.value && !e.target.closest('.combined-filter')) {
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
.combined-filter {
  position: relative;
  min-width: 200px;
  flex-shrink: 0;
}

.filter-trigger {
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
  gap: 8px;
}

.filter-trigger:hover {
  border-color: var(--accent);
}

.open .filter-trigger {
  border-color: var(--accent);
}

.trigger-display {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.placeholder,
.selected-text {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

.dropdown-arrow {
  color: var(--text-muted);
  transition: transform 0.15s;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.filter-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  width: 280px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  z-index: 100;
  max-height: 320px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.filter-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
  border-bottom: 2px solid transparent;
}

.tab-btn:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.dropdown-search {
  padding: 8px;
  border-bottom: 1px solid var(--border);
}

.dropdown-search .search-wrapper {
  position: relative;
}

.search-icon-inline {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 6px 8px 6px 28px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 12px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.options-list {
  flex: 1;
  overflow-y: auto;
  min-height: 40px;
  max-height: 220px;
}

.empty-state {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.1s;
}

.option-item:hover {
  background: var(--bg-secondary);
}

.option-item.selected {
  background: var(--accent-alpha);
}

.option-checkbox {
  width: 16px;
  height: 16px;
  border: 1px solid var(--border);
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.1s;
  color: transparent;
}

.option-checkbox.checked {
  background: var(--accent);
  border-color: var(--accent);
  color: white;
}

.option-label {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
