const defaultState = {
    songsMetaData: []
};

const SongsReducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'LOAD_SONG_LIST':
            return {
                ...state,
                songsMetaData: action.songsMetaData
            };
        default: return state
    }
};

export default SongsReducer;