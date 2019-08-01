import { createStore, combineReducers } from 'redux';
import SongsReducer from '../reducers/songsReducer';
import ActiveSongReducer from '../reducers/activeSongReducer';

const ConfigureStore = () => {
    const store = createStore(
        combineReducers({
            songs: SongsReducer,
            activeSong: ActiveSongReducer
        }),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    return store;
}

export default ConfigureStore;