import { createAlbum, deleteAlbum, getAlbum, getAlbums, reorderAlbumTracks, deleteAlbumTrack, updateAlbum, uploadAlbumTrack } from './albums.js'
import { createArtist, deleteArtist, downloadArtist, getArtist, getArtistAlbums, getArtists, getArtistTracks, updateArtist } from './artists.js'
import { getMe, login, register } from './auth.js'
import { deleteTrack, downloadAlbumZip, downloadArtistZip, downloadTrack, getStreamUrl, getTrack, getTrackCount, getTracks, getTrackStreamBlob, updateTrack, uploadTrack } from './tracks.js'
export const api = {
    login, register, getMe,
    getArtists, downloadArtist, getArtist, createArtist, updateArtist, deleteArtist, getArtistTracks, getArtistAlbums,
    getTracks, getTrack, getTrackCount, uploadTrack, updateTrack, deleteTrack, getStreamUrl, getTrackStreamBlob, downloadTrack, downloadAlbumZip, downloadArtistZip,
    getAlbums, getAlbum, createAlbum, updateAlbum, deleteAlbum, uploadAlbumTrack, reorderAlbumTracks, deleteAlbumTrack
}
