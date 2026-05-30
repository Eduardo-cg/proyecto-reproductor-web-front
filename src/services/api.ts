import { createAlbum, deleteAlbum, deleteAlbumTrack, getAlbum, getAlbums, reorderAlbumTracks, updateAlbum, uploadAlbumTrack } from './albums'
import { createArtist, deleteArtist, downloadArtist, getAlbumsList, getArtist, getArtistAlbums, getArtists, getArtistsList, getArtistTracks, updateArtist } from './artists'
import { getMe, login, register } from './auth'
import { getStorageUsage } from './storage'
import { deleteTrack, downloadAlbumZip, downloadArtistZip, downloadTrack, getStreamUrl, getTrack, getTrackCount, getTracks, getTrackStreamBlob, updateTrack, uploadTrack } from './tracks'

export const api = {
    login, register, getMe, getStorageUsage,
    getArtists, downloadArtist, getArtist, createArtist, updateArtist, deleteArtist, getArtistTracks, getArtistAlbums, getArtistsList, getAlbumsList,
    getTracks, getTrack, getTrackCount, uploadTrack, updateTrack, deleteTrack, getStreamUrl, getTrackStreamBlob, downloadTrack, downloadAlbumZip, downloadArtistZip,
    getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum, uploadAlbumTrack, reorderAlbumTracks, deleteAlbumTrack
}
