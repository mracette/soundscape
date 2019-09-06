import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/landingPage.scss';

function LandingPage() {
    return (
        <div id = 'landing-page'>
            <div id = 'song-selection-panel'>
                <Link className = 'song-link' id='song-link-moonrise' to="/play/moonrise">Moonrise</Link>
                <Link className = 'song-link' id='song-link-mornings' to="/play/mornings">Mornings</Link>
            </div>
        </div>
    )
}

export default LandingPage;