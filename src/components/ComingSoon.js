// libs
import React from 'react';

// styles
import '../styles/components/LandingPage.scss';
import '../styles/components/ComingSoon.scss';

export const ComingSoon = () => {

    return (
        <div id='coming-soon' className='fullscreen transparent'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div id='coming-soon-panel' className='flex-col'>
                    <div className='flex-row'><span>Additional content is coming to Soundscape soon.</span></div>
                    <div className='flex-row'><span>To stay in the loop, sign up for email updates below.</span></div>
                    <div className='flex-row'><p>We are also seeking 3D artists to collaborate with. Please get in touch if you have any leads.</p></div>
                </div>
            </div>
        </div>
    )
}