// libs
import React from 'react';

// styles
import '../styles/components/LandingPage.scss';

export const LoadingScreen = () => {

    return (
        <div id='loading-screen' className='front-most off-black fullscreen'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div className='flex-row'><span>Loading...</span></div>
            </div>
        </div>
    )
}