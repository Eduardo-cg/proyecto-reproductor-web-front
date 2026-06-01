import { onScopeDispose, ref, shallowRef } from 'vue'
import { api } from '../services/api'
import type { ArtistDTO } from '../types'

export function useArtistsList() {
  const artists = shallowRef<ArtistDTO[]>([])
  const loading = ref(true)
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const search = ref('')
  const expandedArtistId = ref<number | null>(null)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const loadArtists = async (): Promise<void> => {
    try {
      loading.value = true
      const data = await api.getArtists(currentPage.value, pageSize.value, search.value)
      artists.value = data.artists
      totalElements.value = data.totalElements
      totalPages.value = data.totalPages
      currentPage.value = data.currentPage
      expandedArtistId.value = null
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number): void => {
    currentPage.value = page
    loadArtists()
  }

  const changePageSize = (newSize: number): void => {
    pageSize.value = newSize
    currentPage.value = 0
    loadArtists()
  }

  const handleSearch = (): void => {
    currentPage.value = 0
    loadArtists()
  }

  const refresh = (): void => {
    loadArtists()
  }

  const clearFilters = (): void => {
    search.value = ''
    currentPage.value = 0
    loadArtists()
  }

  const debouncedSearch = (): void => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, 300)
  }

  const toggleExpand = (artistId: number): void => {
    expandedArtistId.value = expandedArtistId.value === artistId ? null : artistId
  }

  onScopeDispose(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
  })

  return {
    artists,
    loading,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    search,
    expandedArtistId,
    loadArtists,
    goToPage,
    changePageSize,
    handleSearch,
    debouncedSearch,
    clearFilters,
    refresh,
    toggleExpand
  }
}
