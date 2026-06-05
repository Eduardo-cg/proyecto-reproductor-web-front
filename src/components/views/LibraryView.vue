<template>
  <div class="library">
    <main class="container">
      <div class="header">
        <AppLogo />
        <div class="header-buttons">
          <button
            class="btn btn-primary"
            aria-label="Añadir contenido"
            @click="showUploadModal = true"
          >
            <Icon
              name="plus"
              size="16"
            />
            {{ t('library.add') }}
          </button>
        </div>
      </div>

      <div
        class="view-tabs"
        role="tablist"
        aria-label="Vista de biblioteca"
      >
        <button
          :class="['tab-btn', { active: viewMode === 'tracks' }]"
          role="tab"
          :aria-selected="viewMode === 'tracks'"
          :aria-controls="'panel-tracks'"
          @click="switchToTracks"
        >
          <Icon
            name="music"
            size="16"
          />
          {{ t('library.tracks') }}
        </button>
        <button
          :class="['tab-btn', { active: viewMode === 'album' }]"
          role="tab"
          :aria-selected="viewMode === 'album'"
          :aria-controls="'panel-albums'"
          @click="switchToAlbums"
        >
          <Icon
            name="album"
            size="16"
          />
          {{ t('library.albums') }}
        </button>
        <button
          :class="['tab-btn', { active: viewMode === 'artist' }]"
          role="tab"
          :aria-selected="viewMode === 'artist'"
          :aria-controls="'panel-artists'"
          @click="switchToArtists"
        >
          <Icon
            name="artist"
            size="16"
          />
          {{ t('library.artists') }}
        </button>
      </div>

      <div
        v-if="viewMode === 'tracks'"
        id="panel-tracks"
        role="tabpanel"
      >
        <TracksView />
      </div>
      <div
        v-if="viewMode === 'album'"
        id="panel-albums"
        role="tabpanel"
      >
        <AlbumsView />
      </div>
      <div
        v-if="viewMode === 'artist'"
        id="panel-artists"
        role="tabpanel"
      >
        <ArtistsView />
      </div>

      <UploadModal
        v-model="showUploadModal"
        @uploaded="handleUploaded"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTracksList } from '../../composables/useTracksList'
import { useAlbumsList } from '../../composables/useAlbumsList'
import { useArtistsList } from '../../composables/useArtistsList'
import AppLogo from '../common/AppLogo.vue'
import Icon from '../icons/Icon.vue'
import UploadModal from '../modals/UploadModal.vue'
import AlbumsView from './AlbumsView.vue'
import ArtistsView from './ArtistsView.vue'
import TracksView from './TracksView.vue'

const { t } = useI18n()

const viewMode = ref<'tracks' | 'album' | 'artist'>('tracks')
const showUploadModal = ref(false)

const tracksList = useTracksList()
const albumsList = useAlbumsList()
const artistsList = useArtistsList()

const switchToTracks = () => {
  viewMode.value = 'tracks'
}

const switchToAlbums = () => {
  viewMode.value = 'album'
}

const switchToArtists = () => {
  viewMode.value = 'artist'
}

const handleUploaded = (type: 'tracks' | 'album' | 'artist') => {
  if (type !== viewMode.value) return
  if (type === 'tracks') {
    tracksList.refresh()
  } else if (type === 'album') {
    albumsList.refresh()
  } else {
    artistsList.refresh()
  }
}
</script>

<style scoped>
.library {
  min-height: 100vh;
  padding-bottom: var(--player-height);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.view-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
    text-align: center;
    margin: 16px 0;
  }

  .header-buttons {
    justify-content: center;
  }
}
</style>
