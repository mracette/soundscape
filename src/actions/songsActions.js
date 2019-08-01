export const loadSongList = ( songsMetaData ) => {
    return {
        type: 'LOAD_SONG_LIST',
        songsMetaData
    }
}