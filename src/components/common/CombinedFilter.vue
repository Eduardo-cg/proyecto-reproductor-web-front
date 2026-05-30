<template>
  <div class="combined-filter" :class="[isOpen ? 'open' : '', tabSizeClass]">
    <div class="filter-trigger" @click="toggleDropdown" role="combobox" :aria-expanded="isOpen"
      :aria-label="t('library.filters')" tabindex="0" @keydown.enter.prevent="toggleDropdown"
      @keydown.space.prevent="toggleDropdown">
      <div class="trigger-display">
        <template v-if="totalSelected === 0 && !sortBy">
          <span class="placeholder">{{ t('library.filters') }}</span>
        </template>
        <template v-else>
          <span class="selected-text">
            <template v-if="totalSelected > 0">{{ t('library.selectedCount', { count: totalSelected }) }}</template>
            <template v-if="totalSelected > 0 && sortBy"> · </template>
            <template v-if="sortBy">{{ t('library.sortBy') }}: {{ currentSortLabel }}</template>
          </span>
        </template>
      </div>
      <Icon name="chevron-down" size="12" class="dropdown-arrow" :class="{ rotated: isOpen }" />
    </div>

    <div v-if="isOpen" class="filter-dropdown" @click.stop>
      <div class="filter-tabs">
        <button v-if="showArtists" class="tab-btn" :class="{ active: activeTab === 'artist' }" @click="switchTab('artist')">
          <Icon name="artist" size="14" />
          <span>{{ t('library.filterByArtist') }}</span>
        </button>
        <button v-if="showAlbums && hasAlbums" class="tab-btn" :class="{ active: activeTab === 'album' }" @click="switchTab('album')">
          <Icon name="album" size="14" />
          <span>{{ t('library.filterByAlbum') }}</span>
        </button>
        <button v-if="showSort" class="tab-btn" :class="{ active: activeTab === 'sort' }" @click="switchTab('sort')">
          <Icon name="sort" size="14" />
          <span>{{ t('library.sort') }}</span>
        </button>
      </div>

      <template v-if="activeTab === 'sort'">
        <div class="sort-section">
          <div class="sort-field">
            <label class="sort-label">{{ t('library.sortBy') }}</label>
            <select v-model="localSortBy" class="sort-select" @change="emitSort">
              <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="sort-field">
            <label class="sort-label">{{ t('library.sortDirection') }}</label>
            <select v-model="localSortDirection" class="sort-select" @change="emitSort">
              <option value="asc">{{ t('library.ascending') }}</option>
              <option value="desc">{{ t('library.descending') }}</option>
            </select>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="dropdown-search">
          <div class="search-wrapper">
            <Icon name="search" size="14" class="search-icon-inline" />
            <input v-model="currentSearchQuery" type="text" :placeholder="t('library.search')"
              class="search-input" ref="searchInput" :aria-label="t('library.search')" />
          </div>
        </div>

        <div class="options-list">
          <div v-if="currentLoading" class="loading-state">{{ t('auth.loading') }}</div>
          <div v-else-if="currentContent.length === 0" class="empty-state">
            {{ t('library.noResults') }}
          </div>
          <div v-else v-for="option in currentContent" :key="option.id" class="option-item"
            :class="{ selected: isSelected(option.id) }" @click="toggleOption(option)" role="option"
            :aria-selected="isSelected(option.id)">
            <div class="option-checkbox" :class="{ checked: isSelected(option.id) }">
              <Icon v-if="isSelected(option.id)" name="check" size="12" />
            </div>
            <span class="option-label">{{ option.title || option.name }}</span>
          </div>
        </div>

        <div v-if="currentTotalPages > 1" class="pagination-controls">
          <button class="page-btn" :disabled="currentCurrentPage <= 1" @click="prevPage">◀</button>
          <span class="page-info">{{ currentCurrentPage }} / {{ currentTotalPages }}</span>
          <button class="page-btn" :disabled="currentCurrentPage >= currentTotalPages" @click="nextPage">▶</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '../../services/api.js'
import Icon from '../icons/Icon.vue'

const { t } = useI18n()

const props = defineProps({
  artistIds: { type: Array, default: () => [] },
  albumIds: { type: Array, default: () => [] },
  showArtists: { type: Boolean, default: true },
  showAlbums: { type: Boolean, default: true },
  showSort: { type: Boolean, default: true },
  sortBy: { type: String, default: '' },
  sortDirection: { type: String, default: 'asc' },
  sortOptions: { type: Array, default: () => [] },
})

const emit = defineEmits(['update:artistIds', 'update:albumIds', 'update:sortBy', 'update:sortDirection'])

const isOpen = ref(false)
const activeTab = ref('artist')
const searchInput = ref(null)
const localSortBy = ref(props.sortBy)
const localSortDirection = ref(props.sortDirection)

const artistSearchQuery = ref('')
const albumSearchQuery = ref('')
const artistPage = ref(0)
const albumPage = ref(0)
const artistData = ref({ content: [], totalElements: 0, totalPages: 0, currentPage: 0 })
const albumData = ref({ content: [], totalElements: 0, totalPages: 0, currentPage: 0 })
const artistLoading = ref(false)
const albumLoading = ref(false)

let searchDebounce = null

const totalSelected = computed(() => {
  return (props.artistIds?.length || 0) + (props.albumIds?.length || 0)
})

const currentSortLabel = computed(() => {
  const opt = props.sortOptions.find(o => o.value === localSortBy.value)
  return opt ? opt.label : ''
})

const tabCount = computed(() => {
  let count = 0
  if (props.showArtists) count++
  if (props.showAlbums) count++
  if (props.showSort) count++
  return count
})

const tabSizeClass = computed(() => `tabs-${tabCount.value}`)

const hasAlbums = computed(() => {
  return albumData.value.totalElements > 0 || albumLoading.value || albumSearchQuery.value.length > 0
})

const currentPaginatedData = computed(() =>
  activeTab.value === 'artist' ? artistData.value : albumData.value
)

const currentLoading = computed(() =>
  activeTab.value === 'artist' ? artistLoading.value : albumLoading.value
)

const currentSearchQuery = computed({
  get: () => activeTab.value === 'artist' ? artistSearchQuery.value : albumSearchQuery.value,
  set: (val) => {
    if (activeTab.value === 'artist') artistSearchQuery.value = val
    else albumSearchQuery.value = val
  }
})

const currentContent = computed(() => currentPaginatedData.value.content || [])
const currentTotalPages = computed(() => currentPaginatedData.value.totalPages || 0)
const currentCurrentPage = computed(() => (currentPaginatedData.value.currentPage || 0) + 1)

const isSelected = (id) => {
  const ids = activeTab.value === 'artist' ? (props.artistIds || []) : (props.albumIds || [])
  return ids.includes(id)
}

const toggleOption = (option) => {
  const current = activeTab.value === 'artist'
    ? [...(props.artistIds || [])]
    : [...(props.albumIds || [])]
  const id = option.id
  const index = current.indexOf(id)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(id)
  }
  const event = activeTab.value === 'artist' ? 'update:artistIds' : 'update:albumIds'
  emit(event, current)
}

const emitSort = () => {
  emit('update:sortBy', localSortBy.value)
  emit('update:sortDirection', localSortDirection.value)
}

const loadArtists = async () => {
  artistLoading.value = true
  try {
    artistData.value = await api.getArtistsList(artistPage.value, 10, artistSearchQuery.value)
  } catch (e) { console.error(e) }
  artistLoading.value = false
}

const loadAlbums = async () => {
  albumLoading.value = true
  try {
    albumData.value = await api.getAlbumsList(props.artistIds, albumPage.value, 10, albumSearchQuery.value)
  } catch (e) { console.error(e) }
  albumLoading.value = false
}

const nextPage = () => {
  if (activeTab.value === 'artist') {
    if (artistPage.value < artistData.value.totalPages - 1) artistPage.value++
  } else {
    if (albumPage.value < albumData.value.totalPages - 1) albumPage.value++
  }
}

const prevPage = () => {
  if (activeTab.value === 'artist') {
    if (artistPage.value > 0) artistPage.value--
  } else {
    if (albumPage.value > 0) albumPage.value--
  }
}

const switchTab = (tab) => {
  activeTab.value = tab
  nextTick(() => {
    searchInput.value?.focus()
  })
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    artistSearchQuery.value = ''
    albumSearchQuery.value = ''
    artistPage.value = 0
    albumPage.value = 0
    if (props.showArtists) {
      activeTab.value = 'artist'
    } else if (props.showAlbums) {
      activeTab.value = 'album'
    } else if (props.showSort) {
      activeTab.value = 'sort'
    }
    if (props.showArtists) loadArtists()
    if (props.showAlbums) loadAlbums()
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

watch(artistSearchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => { artistPage.value = 0; loadArtists() }, 300)
})

watch(artistPage, () => loadArtists())

watch(albumSearchQuery, () => {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => { albumPage.value = 0; loadAlbums() }, 300)
})

watch(albumPage, () => loadAlbums())

watch(() => props.artistIds, () => {
  emit('update:albumIds', [])
  albumPage.value = 0
  albumSearchQuery.value = ''
  if (isOpen.value && props.showAlbums) loadAlbums()
}, { deep: true })

watch(isOpen, (open) => {
  if (!open) {
    artistSearchQuery.value = ''
    albumSearchQuery.value = ''
    artistPage.value = 0
    albumPage.value = 0
  }
})

watch(() => props.sortBy, (val) => { localSortBy.value = val })
watch(() => props.sortDirection, (val) => { localSortDirection.value = val })

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  clearTimeout(searchDebounce)
})
</script>

<style scoped>
.combined-filter {
  position: relative;
  flex-shrink: 0;
}

.tabs-1 .filter-dropdown {
  min-width: 240px;
  width: 240px;
}

.tabs-2 .filter-dropdown {
  min-width: 300px;
  width: 300px;
}

.tabs-3 .filter-dropdown {
  min-width: 360px;
  width: 360px;
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
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  z-index: 100;
  max-height: 380px;
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

.sort-section {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sort-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sort-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sort-select {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

.sort-select:focus {
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

.loading-state {
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

.pagination-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px;
  border-top: 1px solid var(--border);
}

.page-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 4px 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 12px;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn:not(:disabled):hover {
  background: var(--bg-secondary);
}

.page-info {
  font-size: 11px;
  color: var(--text-muted);
}
</style>
