// libs
import React from 'react';
import { Link } from 'react-router-dom';

// components
import { MoonriseIcon } from './custom-song-icons/MoonriseIcon';
import { MorningsIcon } from './custom-song-icons/MorningsIcon';
import { ComingSoonIcon } from './custom-song-icons/ComingSoonIcon';

// styles
import '../styles/components/LandingPage.scss';

export const landingPageReducer = (state, action) => {
    switch (action.type) {
        case 'moonrise':
            return {
                name: 'Moonrise',
                bpm: '60',
                key: 'G Minor'
            };
        case 'mornings':
            return {
                name: 'Mornings',
                bpm: '92',
                key: 'Eb Major'
            };
        case 'coming-soon':
            return {
                name: 'Coming soon...',
                bpm: null,
                key: null
            };
        default:
            return {
                name: null,
                bpm: null,
                key: null
            };
    }
}

export const LandingPage = () => {

    const landingPageDispatch = React.createContext(null);
    const [selected, dispatch] = React.useReducer(landingPageReducer, { name: null, bpm: null, key: null });

    return (
        <landingPageDispatch.Provider value={dispatch}>
            <div id='landing-page'>
                <div id='landing-page-header'>
                    <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                    <div className='flex-row'><span>This application uses audio.</span></div>
                    <div className='flex-row'><span>Use speakers or headphones for the best experience.</span></div>
                    <div className='flex-row'><p>
                        <span id='landing-page-song-title'>{selected.name || "Choose a song to begin."}</span>
                        {selected.bpm && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-bpm'>{` ${selected.bpm} bpm`}</span></>)}
                        {selected.key && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-key'>{selected.key}</span></>)}
                    </p></div>
                </div>
                <div id='song-selection-panel'>
                    <Link className='song-link' id='song-link-moonrise' to="/play/moonrise">
                        <MoonriseIcon name='moonrise' />
                    </Link>
                    <Link className='song-link' id='song-link-mornings' to="/play/mornings">
                        <MorningsIcon name='mornings' />
                    </Link>
                    <Link className='song-link' id='song-link-coming-soon' to="/coming-soon">
                        <ComingSoonIcon name='coming-soon' />
                    </Link>
                </div>
            </div>
        </landingPageDispatch.Provider>
    )
}