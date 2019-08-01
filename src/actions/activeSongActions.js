export const loadNewSong = ({name, bpm, timeSignature, groups}) => {
    return {
        type: 'LOAD_NEW_SONG',
        updates: {
            name,
            bpm,
            timeSignature,
            groups
        }
    }
}

export const initToneObjects = ({transport, context, state, playersLoaded, totalPlayers, playersLoadedProgress}) => {
    return {
        type: 'INIT_TONE_OBJECTS',
        updates: {
            transport,
            context,
            state,
            playersLoaded,
            totalPlayers,
            playersLoadedProgress
        }
    }
}

export const incrementPlayersLoaded = () => {
    return {
        type: 'INCREMENT_PLAYERS_LOADED'
    }
}