import { onScopeDispose, ref, shallowRef } from 'vue'
import { api } from '../services/api'
import type { TrackDTO } from '../types'

export function useTracksList() {
  const tracks = shallowRef<TrackDTO[]>([])
  const loading = ref(true)
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const search = ref('')
  const sortBy = ref('title')
  const sortDirection = ref('asc')
  const selectedArtistIds = ref<number[]>([])
  const selectedAlbumIds = ref<number[]>([])

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const loadTracks = async (): Promise<void> => {
    try {
      loading.value = true
      const res = await api.getTracks(
        currentPage.value,
        pageSize.value,
        search.value,
        selectedArtistIds.value,
        selectedAlbumIds.value,
        sortBy.value,
        sortDirection.value
      )
      tracks.value = res.tracks
      totalElements.value = res.totalElements
      totalPages.value = res.totalPages
      currentPage.value = res.currentPage
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number): void => {
    currentPage.value = page
    loadTracks()
  }

  const changePageSize = (newSize: number): void => {
    pageSize.value = newSize
    currentPage.value = 0
    loadTracks()
  }

  const handleSearch = (): void => {
    currentPage.value = 0
    loadTracks()
  }

  const refresh = (): void => {
    loadTracks()
  }

  const clearFilters = (): void => {
    search.value = ''
    selectedArtistIds.value = []
    selectedAlbumIds.value = []
    sortBy.value = 'title'
    sortDirection.value = 'asc'
    currentPage.value = 0
    loadTracks()
  }

  const debouncedSearch = (): void => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, 300)
  }

  onScopeDispose(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
  })

  return {
    tracks,
    loading,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    search,
    sortBy,
    sortDirection,
    selectedArtistIds,
    selectedAlbumIds,
    loadTracks,
    goToPage,
    changePageSize,
    handleSearch,
    debouncedSearch,
    clearFilters,
    refresh
  }
}
