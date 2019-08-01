const defaultState = {
    name: '',
    bpm: '',
    timeSignature: '',
    groups: [],
    effects: [],
    state: undefined,
    transport: undefined,
    context: undefined,
    totalPlayers: undefined,
    playersLoaded: undefined,
    playersLoadedProgress: undefined
};

const ActiveSongReducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'LOAD_NEW_SONG':
            return {
                ...state,
                ...action.updates
            };
        case 'INIT_TONE_OBJECTS':
            return {
                ...state,
                ...action.updates
            };
        case 'INCREMENT_PLAYERS_LOADED':
            return {
                ...state,
                playersLoaded: state.playersLoaded + 1,
                playersLoadedProgress: state.playersLoaded + 1 / state.totalPlayers
            };
        default: return state
    }
};

export default ActiveSongReducer;