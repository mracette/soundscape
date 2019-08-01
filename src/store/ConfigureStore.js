import { createStore, combineReducers } from 'redux';
import SongReducer from '../reducers/songs';

const ConfigureStore = () => {
    const store = createStore(
        combineReducers({
            songs: SongReducer
        }),
        window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
    );
    return store;
}

export default ConfigureStore;