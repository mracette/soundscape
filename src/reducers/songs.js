
const defaultState = {
    name: '',
    bpm: 0,
    groups: []
};

const SongReducer = (state = defaultState, action) => {
    switch(action.type) {
        case 'LOAD_NEW_SONG':
            console.log({
                ...state,
                ...action.updates
            });
            return {
                ...state,
                ...action.updates
            };
        default: return state
    }
};

export default SongReducer;