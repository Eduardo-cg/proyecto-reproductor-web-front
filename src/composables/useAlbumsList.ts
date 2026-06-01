import { onScopeDispose, ref, shallowRef } from 'vue'
import { api } from '../services/api'
import type { AlbumDTO, TrackDTO } from '../types'

export function useAlbumsList() {
  const albums = shallowRef<AlbumDTO[]>([])
  const loading = ref(true)
  const currentPage = ref(0)
  const pageSize = ref(10)
  const totalElements = ref(0)
  const totalPages = ref(0)
  const search = ref('')
  const sortBy = ref('title')
  const sortDirection = ref('asc')
  const selectedArtistIds = ref<number[]>([])
  const albumTracksMap = ref<Record<number, TrackDTO[]>>({})
  const albumTracksLoading = ref<Set<number>>(new Set())
  const expandedAlbumId = ref<number | null>(null)

  let searchTimeout: ReturnType<typeof setTimeout> | null = null

  const loadAlbums = async (): Promise<void> => {
    try {
      loading.value = true
      const res = await api.getAlbums(
        currentPage.value,
        pageSize.value,
        search.value,
        selectedArtistIds.value,
        sortBy.value,
        sortDirection.value
      )
      albums.value = res.albums
      totalElements.value = res.totalElements
      totalPages.value = res.totalPages
      currentPage.value = res.currentPage
      expandedAlbumId.value = null
      albumTracksMap.value = {}
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const goToPage = (page: number): void => {
    currentPage.value = page
    loadAlbums()
  }

  const changePageSize = (newSize: number): void => {
    pageSize.value = newSize
    currentPage.value = 0
    loadAlbums()
  }

  const handleSearch = (): void => {
    currentPage.value = 0
    loadAlbums()
  }

  const refresh = (): void => {
    loadAlbums()
  }

  const clearFilters = (): void => {
    search.value = ''
    selectedArtistIds.value = []
    sortBy.value = 'title'
    sortDirection.value = 'asc'
    currentPage.value = 0
    loadAlbums()
  }

  const debouncedSearch = (): void => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      handleSearch()
    }, 300)
  }

  const toggleAlbum = async (albumId: number): Promise<void> => {
    if (expandedAlbumId.value === albumId) {
      expandedAlbumId.value = null
      return
    }
    expandedAlbumId.value = albumId

    if (albumTracksMap.value[albumId]) return

    albumTracksLoading.value = new Set([...albumTracksLoading.value, albumId])
    try {
      const data = await api.getAlbum(albumId)
      albumTracksMap.value = { ...albumTracksMap.value, [albumId]: data.tracks }
    } catch (e) {
      console.error(e)
    } finally {
      const next = new Set(albumTracksLoading.value)
      next.delete(albumId)
      albumTracksLoading.value = next
    }
  }

  onScopeDispose(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
  })

  return {
    albums,
    loading,
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    search,
    sortBy,
    sortDirection,
    selectedArtistIds,
    albumTracksMap,
    albumTracksLoading,
    expandedAlbumId,
    loadAlbums,
    goToPage,
    changePageSize,
    handleSearch,
    debouncedSearch,
    clearFilters,
    refresh,
    toggleAlbum
  }
}
