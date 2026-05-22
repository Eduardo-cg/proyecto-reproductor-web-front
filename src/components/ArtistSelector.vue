<template>
  <div class="artist-selector" :class="{ open: isOpen }">
    <div class="selector-trigger" @click="toggleDropdown" role="combobox" :aria-expanded="isOpen" :aria-label="placeholder || t('library.selectArtist')" tabindex="0" @keydown.enter.prevent="toggleDropdown" @keydown.space.prevent="toggleDropdown">
      <div class="selector-display">
        <template v-if="selectedArtists.length === 0">
          <span class="placeholder">{{ placeholder || t('library.selectArtist') }}</span>
        </template>
        <template v-else-if="compact">
          <span class="selected-summary">
            {{ selectedArtists[0].name }}
            <span v-if="selectedArtists.length > 1" class="and-more">
              {{ t('library.andMore').replace('{count}', selectedArtists.length - 1) }}
            </span>
          </span>
        </template>
        <template v-else>
          <div class="selected-chips">
            <span v-for="(artist, index) in selectedArtists" :key="artist.id" class="artist-chip"
              :class="{ 'primary-chip': index === 0 }">
              <img v-if="artist.image" :src="artist.image" alt="" class="chip-image" />
              <span class="chip-name">
                {{ artist.name }}
                <span v-if="index === 0" class="primary-badge">{{ t('library.primary') }}</span>
              </span>
              <button type="button" class="chip-remove" @click.stop="removeArtist(index)"
                :aria-label="'Eliminar ' + artist.name">
                <Icon name="close" size="12" />
              </button>
            </span>
          </div>
        </template>
      </div>
      <div class="selector-actions">
        <button type="button" class="btn-add-artist" @click.stop="openCreateModal"
          :title="t('library.createArtist')" aria-label="Crear nuevo artista">
          <Icon name="plus" size="14" />
        </button>
        <Icon name="chevron-down" size="12" class="dropdown-arrow" :class="{ rotated: isOpen }" />
      </div>
    </div>

    <div v-if="isOpen" class="selector-dropdown" @click.stop role="listbox" :aria-label="t('library.selectArtist')">
      <div class="dropdown-search">
        <div class="search-wrapper">
          <Icon name="search" size="14" class="search-icon-inline" />
          <input v-model="searchQuery" type="text" :placeholder="t('library.searchArtist')"
            class="search-input" ref="searchInput" aria-label="Buscar artista" />
        </div>
      </div>

      <div v-if="selectedArtists.length > 0" class="selected-section">
        <div class="section-label">{{ t('library.selectedArtists').replace('{count}', selectedArtists.length) }}</div>
        <div class="selected-list" ref="sortableContainer">
          <div v-for="(artist, index) in selectedArtists" :key="artist.id" class="selected-item"
            :class="{ 'primary-item': index === 0 }" :data-id="artist.id" role="option" :aria-selected="true">
            <span class="drag-handle" :title="t('library.dragToReorderArtists')" aria-hidden="true">
              <Icon name="drag" size="14" />
            </span>
            <img v-if="artist.image" :src="artist.image" alt="" class="item-image" />
            <div v-else class="item-image-placeholder" aria-hidden="true">
              <Icon name="artist" size="14" />
            </div>
            <span class="item-name">{{ artist.name }}</span>
            <span v-if="index === 0" class="item-primary-tag">{{ t('library.primaryArtist') }}</span>
            <button type="button" class="item-remove" @click="removeArtist(index)"
              :aria-label="'Eliminar ' + artist.name">
              <Icon name="close" size="14" />
            </button>
          </div>
        </div>
      </div>

      <div class="available-section">
        <div class="section-label">
          {{ availableArtists.length === 0 ? t('library.noArtists') : `${availableArtists.length} ${t('library.artists')}` }}
        </div>
        <div class="available-list">
          <div v-if="availableArtists.length === 0 && !loading" class="empty-state">
            {{ t('library.noArtists') }}
          </div>
          <div v-else-if="loading" class="loading-state">
            {{ t('auth.loading') }}
          </div>
          <div v-for="artist in availableArtists" :key="artist.id"
            class="available-item" :class="{ disabled: isSelected(artist.id) }"
            @click="toggleArtist(artist)" role="option" :aria-selected="false">
            <input type="checkbox" :checked="isSelected(artist.id)" :disabled="isSelected(artist.id)"
              class="item-checkbox" @click.stop :aria-label="artist.name" />
            <img v-if="artist.image" :src="artist.image" alt="" class="item-image" />
            <div v-else class="item-image-placeholder" aria-hidden="true">
              <Icon name="artist" size="14" />
            </div>
            <span class="item-name">{{ artist.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <UploadArtistModal :show-upload="showCreateModal" @update:show-upload="showCreateModal = false"
      @created="onArtistCreated" @uploaded="$emit('artistCreated')" />
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import Sortable from 'sortablejs'
import { api } from '../services/api'
import UploadArtistModal from './UploadArtistModal.vue'
import Icon from './icons/Icon.vue'

const { t } = useI18n()

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: '' },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'artistCreated'])

const isOpen = ref(false)
const searchQuery = ref('')
const allArtists = ref([])
const selectedArtists = ref([])
const loading = ref(false)
const showCreateModal = ref(false)
const searchInput = ref(null)
const sortableContainer = ref(null)
let sortableInstance = null

const availableArtists = computed(() => {
  const selectedIds = new Set(selectedArtists.value.map(a => a.id))
  let filtered = allArtists.value.filter(a => !selectedIds.has(a.id))

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(a => a.name.toLowerCase().includes(q))
  }

  return filtered
})

const isSelected = (id) => selectedArtists.value.some(a => a.id === id)

const fetchArtists = async () => {
  loading.value = true
  try {
    allArtists.value = await api.getArtists()
  } catch (e) {
    console.error('Error fetching artists:', e)
    allArtists.value = []
  } finally {
    loading.value = false
  }
}

const toggleArtist = (artist) => {
  if (isSelected(artist.id)) return
  selectedArtists.value = [...selectedArtists.value, { ...artist }]
  emitValue()
}

const removeArtist = (index) => {
  selectedArtists.value.splice(index, 1)
  selectedArtists.value = [...selectedArtists.value]
  emitValue()
}

const emitValue = () => {
  emit('update:modelValue', selectedArtists.value.map(a => a.id))
}

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    fetchArtists()
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

const openCreateModal = () => {
  showCreateModal.value = true
}

const onArtistCreated = (artist) => {
  allArtists.value = [...allArtists.value, artist]
  selectedArtists.value = [...selectedArtists.value, artist]
  emitValue()
}

const initSortable = () => {
  if (!sortableContainer.value) return
  destroySortable()
  sortableInstance = Sortable.create(sortableContainer.value, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: (evt) => {
      const oldIndex = evt.oldIndex
      const newIndex = evt.newIndex
      if (oldIndex !== newIndex) {
        const [removed] = selectedArtists.value.splice(oldIndex, 1)
        selectedArtists.value.splice(newIndex, 0, removed)
        selectedArtists.value = [...selectedArtists.value]
        emitValue()
      }
    }
  })
}

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

watch(() => props.modelValue, (newVal) => {
  const ids = newVal || []
  selectedArtists.value = ids.map(id => {
    const found = allArtists.value.find(a => a.id === id)
    return found || { id, name: `Artist ${id}` }
  })
  const missingIds = ids.filter(id => !allArtists.value.find(a => a.id === id))
  if (missingIds.length > 0) {
    Promise.all(missingIds.map(id => api.getArtist(id).catch(() => null)))
      .then(artists => {
        const valid = artists.filter(Boolean)
        if (valid.length > 0) {
          allArtists.value = [...allArtists.value, ...valid]
        }
      })
  }
}, { immediate: true })

watch(allArtists, () => {
  const ids = props.modelValue || []
  selectedArtists.value = ids.map(id => {
    const found = allArtists.value.find(a => a.id === id)
    return found || { id, name: `Artist ${id}` }
  })
})

watch(isOpen, (open) => {
  if (open) {
    nextTick(initSortable)
  } else {
    destroySortable()
  }
})

const handleClickOutside = (e) => {
  if (isOpen.value && !e.target.closest('.artist-selector')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  fetchArtists()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  destroySortable()
})
</script>

<style scoped>
.artist-selector {
  position: relative;
  width: 100%;
}

.selector-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 40px;
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: border-color var(--transition);
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
}

.placeholder {
  color: var(--text-muted);
  font-size: 14px;
}

.selected-summary {
  font-size: 14px;
  color: var(--text-primary);
}

.and-more {
  color: var(--text-secondary);
  margin-left: 4px;
  font-size: 13px;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.artist-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.primary-chip {
  background: var(--accent-alpha);
  border: 1px solid var(--accent);
}

.chip-image {
  width: 18px;
  height: 18px;
  border-radius: 2px;
  object-fit: cover;
}

.chip-name {
  display: flex;
  align-items: center;
  gap: 4px;
}

.primary-badge {
  font-size: 10px;
  color: var(--accent);
  font-weight: 600;
}

.chip-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 2px;
  color: var(--text-muted);
}
.chip-remove:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.selector-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.btn-add-artist {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--bg-primary);
  border-radius: var(--radius-sm);
  transition: opacity var(--transition);
}
.btn-add-artist:hover {
  opacity: 0.85;
}

.dropdown-arrow {
  color: var(--text-muted);
  transition: transform 0.15s;
  flex-shrink: 0;
}
.dropdown-arrow.rotated {
  transform: rotate(180deg);
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
  max-height: 360px;
  display: flex;
  flex-direction: column;
}

.dropdown-search {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.search-wrapper {
  position: relative;
}

.search-icon-inline {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 7px 10px 7px 32px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 13px;
}
.search-input:focus {
  outline: none;
  border-color: var(--accent);
}

.selected-section,
.available-section {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-label {
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  background: var(--bg-secondary);
}

.selected-list {
  max-height: 140px;
  overflow-y: auto;
}

.available-list {
  flex: 1;
  overflow-y: auto;
  min-height: 80px;
}

.empty-state,
.loading-state {
  padding: 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.selected-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  transition: background 0.1s;
}
.selected-item:hover {
  background: var(--bg-secondary);
}

.primary-item {
  background: var(--accent-alpha);
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  color: var(--text-muted);
  padding: 2px;
  border-radius: 2px;
}
.drag-handle:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}
.drag-handle:active {
  cursor: grabbing;
}

.item-image {
  width: 26px;
  height: 26px;
  border-radius: 2px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-image-placeholder {
  width: 26px;
  height: 26px;
  border-radius: 2px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.item-name {
  flex: 1;
  font-size: 13px;
  color: var(--text-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-primary-tag {
  font-size: 10px;
  color: var(--accent);
  font-weight: 600;
  padding: 2px 4px;
  background: var(--accent-alpha);
  border-radius: 2px;
}

.item-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 2px;
  color: var(--text-muted);
  visibility: hidden;
}
.selected-item:hover .item-remove {
  visibility: visible;
}
.item-remove:hover {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.available-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.1s;
}
.available-item:hover:not(.disabled) {
  background: var(--bg-secondary);
}
.available-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.item-checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .selector-dropdown {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    max-height: none;
    border-radius: 0;
    z-index: 300;
  }

  .available-list {
    flex: 1;
    min-height: 0;
  }
}
</style>
