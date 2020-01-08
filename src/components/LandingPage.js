// libs
import React from 'react';
import { Link } from 'react-router-dom';

// components
import { MoonriseIcon } from './custom-song-icons/MoonriseIcon';
import { MorningsIcon } from './custom-song-icons/MorningsIcon';
import { ComingSoonIcon } from './custom-song-icons/ComingSoonIcon';

// styles
import '../styles/components/LandingPage.scss';

const background = '#1f262f';

function LandingPage() {

    const [selected, setSelected] = React.useState(null);

    const handleUnsetSelected = () => {
        setSelected(null);
    }

    let bpm, key;

    switch (selected) {
        case 'Moonrise': {
            bpm = '60';
            key = 'G Minor';
            break;
        }
        case 'Mornings': {
            bpm = '92';
            key = 'Eb Major';
            break;
        }
        default: break;
    }

    return (
        <div id='landing-page'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div className='flex-row'><span>This application uses audio.</span></div>
                <div className='flex-row'><span>Use speakers or headphones for the best experience.</span></div>
                <div className='flex-row'><p>
                    <span id='landing-page-song-title'>{selected || "Choose a song to begin."}</span>
                    {selected && bpm && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-bpm'>{` ${bpm} bpm`}</span></>)}
                    {selected && key && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-key'>{key}</span></>)}
                </p></div>
            </div>
            <div id='song-selection-panel'>
                <Link className='song-link' id='song-link-moonrise' to="/play/moonrise">
                    <MoonriseIcon
                        handleSetSelected={() => setSelected('Moonrise')}
                        handleUnsetSelected={handleUnsetSelected}
                    />
                </Link>
                <Link className='song-link' id='song-link-mornings' to="/play/mornings">
                    <MorningsIcon
                        handleSetSelected={() => setSelected('Mornings')}
                        handleUnsetSelected={handleUnsetSelected}
                    />
                </Link>
                <Link className='song-link' id='song-link-coming-soon' to="/coming-soon">
                    <ComingSoonIcon
                        handleSetSelected={() => setSelected('Coming soon...')}
                        handleUnsetSelected={handleUnsetSelected}
                    />
                </Link>
            </div>
        </div>
    )
}

export default LandingPage;