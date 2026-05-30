import { createAlbum, deleteAlbum, getAlbum, getAlbums, reorderAlbumTracks, deleteAlbumTrack, updateAlbum, uploadAlbumTrack } from './albums.js'
import { createArtist, deleteArtist, downloadArtist, getArtist, getArtistAlbums, getArtists, getArtistsList, getAlbumsList, getArtistTracks, updateArtist } from './artists.js'
import { getMe, login, register } from './auth.js'
import { deleteTrack, downloadAlbumZip, downloadArtistZip, downloadTrack, getStreamUrl, getTrack, getTrackCount, getTracks, getTrackStreamBlob, updateTrack, uploadTrack } from './tracks.js'
import { getStorageUsage } from './storage.js'
export const api = {
    login, register, getMe, getStorageUsage,
    getArtists, downloadArtist, getArtist, createArtist, updateArtist, deleteArtist, getArtistTracks, getArtistAlbums, getArtistsList, getAlbumsList,
    getTracks, getTrack, getTrackCount, uploadTrack, updateTrack, deleteTrack, getStreamUrl, getTrackStreamBlob, downloadTrack, downloadAlbumZip, downloadArtistZip,
    getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum, uploadAlbumTrack, reorderAlbumTracks, deleteAlbumTrack
}
