export const loadNewSong = ({name, bpm, groups}) => {
    return {
        type: 'LOAD_NEW_SONG',
        updates: {
            name,
            bpm,
            groups
        }
    }
}