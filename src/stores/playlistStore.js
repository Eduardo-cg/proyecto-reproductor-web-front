import { reactive } from 'vue'

const API_URL = 'http://localhost:8080/api'

export const usePlaylistStore = () => {
  const state = reactive({
    playlists: [],
    currentPlaylist: null,
    loading: false,
    error: null
  })

  const token = () => localStorage.getItem('token')

  const fetchPlaylists = async () => {
    state.loading = true
    try {
      const res = await fetch(`${API_URL}/playlists`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      state.playlists = await res.json()
    } catch (e) {
      state.error = e.message
    } finally {
      state.loading = false
    }
  }

  const fetchPlaylist = async (id) => {
    state.loading = true
    try {
      const res = await fetch(`${API_URL}/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token()}` }
      })
      state.currentPlaylist = await res.json()
    } catch (e) {
      state.error = e.message
    } finally {
      state.loading = false
    }
  }

  const createPlaylist = async (name) => {
    try {
      const res = await fetch(`${API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ name })
      })
      const playlist = await res.json()
      state.playlists.push(playlist)
      return playlist
    } catch (e) {
      state.error = e.message
      return null
    }
  }

  const addTrack = async (playlistId, trackId) => {
    try {
      await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token()}`
        },
        body: JSON.stringify({ trackId })
      })
      if (state.currentPlaylist?.id === playlistId) {
        await fetchPlaylist(playlistId)
      }
    } catch (e) {
      state.error = e.message
    }
  }

  const removeTrack = async (playlistId, trackId) => {
    try {
      await fetch(`${API_URL}/playlists/${playlistId}/tracks/${trackId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      })
      if (state.currentPlaylist?.id === playlistId) {
        await fetchPlaylist(playlistId)
      }
    } catch (e) {
      state.error = e.message
    }
  }

  const deletePlaylist = async (id) => {
    try {
      await fetch(`${API_URL}/playlists/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` }
      })
      state.playlists = state.playlists.filter(p => p.id !== id)
    } catch (e) {
      state.error = e.message
    }
  }

  return {
    state,
    fetchPlaylists,
    fetchPlaylist,
    createPlaylist,
    addTrack,
    removeTrack,
    deletePlaylist
  }
}