// libs
import React from 'react';
import { Link } from 'react-router-dom';

// components
import { Moonrise } from './custom-song-icons/Moonrise';
import { Mornings } from './custom-song-icons/Mornings';

// styles
import '../styles/components/LandingPage.scss';

const background = '#1f262f';

function LandingPage() {
    return (
        <div id='landing-page'>
            <div id='song-selection-panel'>
                <Link className='song-link' id='song-link-moonrise' to="/play/moonrise">
                    <Moonrise />
                </Link>
                <Link className='song-link' id='song-link-mornings' to="/play/mornings">
                    <Mornings />
                </Link>
            </div>
        </div>
    )
}

export default LandingPage;