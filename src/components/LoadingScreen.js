// libs
import React from 'react';

// styles
import '../styles/components/LandingPage.scss';
import '../styles/components/LoadingScreen.scss';

export const LoadingScreen = () => {

    return (
        <div id='loading-screen'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div className='flex-row'><span>Loading...</span></div>
            </div>
        </div>
    )
}