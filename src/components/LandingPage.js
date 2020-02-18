// libs
import React from 'react';
import { Link } from 'react-router-dom';

// components
import { MoonriseIcon } from './custom-song-icons/MoonriseIcon';
import { MorningsIcon } from './custom-song-icons/MorningsIcon';
import { ComingSoonIcon } from './custom-song-icons/ComingSoonIcon';

// styles
import '../styles/components/LandingPage.scss';

// other
import { LandingPageScene } from '../viz/scenes/landing/LandingPageScene';

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
                name: 'The future of Soundscape...',
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

    const [selected, dispatch] = React.useReducer(landingPageReducer, { name: null, bpm: null, key: null });
    const canvasRef = React.useRef(null);

    React.useEffect(() => {

        let scene;

        if (canvasRef.current) {
            scene = new LandingPageScene(canvasRef.current)
            scene.init().then(() => scene.animate());
            window.addEventListener('resize', scene.onWindowResize);
            window.addEventListener('orientationchange', scene.onWindowResize);
            window.addEventListener('fullscreenchange', scene.onWindowResize);
            window.visualViewport && (window.visualViewport.addEventListener('scroll', scene.onWindowResize));
            window.visualViewport && (window.visualViewport.addEventListener('resize', scene.onWindowResize));
        }

        return () => {
            scene.stop();
            scene.disposeAll(scene.scene);
            window.removeEventListener('resize', scene.onWindowResize);
            window.removeEventListener('orientationchange', scene.onWindowResize);
            window.removeEventListener('fullscreenchange', scene.onWindowResize);
            window.visualViewport && (window.visualViewport.removeEventListener('scroll', scene.onWindowResize));
            window.visualViewport && (window.visualViewport.removeEventListener('resize', scene.onWindowResize));
        }

    }, [])

    return (<>
        <canvas
            id='star-canvas'
            className='fullscreen'
            ref={canvasRef}
        />
        <div id='landing-page' className='fullscreen transparent'>
            <div id='landing-page-header'>
                <div className='flex-row'><h1 id='landing-page-soundscape-title'>Soundscape</h1></div>
                <div className='flex-row'><span>This application uses audio.</span></div>
                <div className='flex-row'><span>Use speakers or headphones for the best experience.</span></div>
                <div className='flex-row'><p>
                    <span id={selected.name ? 'landing-page-song-title' : 'choose-a-song'}>{selected.name || "Choose a song to begin."}</span>
                    {selected.bpm && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-bpm'>{` ${selected.bpm} bpm`}</span></>)}
                    {selected.key && (<><span>&nbsp;|&nbsp;</span> <span id='landing-page-key'>{selected.key}</span></>)}
                </p></div>
            </div>
            <div id='song-selection-panel'>
                <Link className='song-link' id='song-link-moonrise' to="/play/moonrise">
                    <MoonriseIcon
                        name='moonrise'
                        dispatch={dispatch}
                    />
                </Link>
                <Link className='song-link' id='song-link-mornings' to="/play/mornings">
                    <MorningsIcon
                        name='mornings'
                        dispatch={dispatch}
                    />
                </Link>
                <Link className='song-link' id='song-link-coming-soon' to="/coming-soon">
                    <ComingSoonIcon
                        name='coming-soon'
                        dispatch={dispatch}
                    />
                </Link>
                {/* fillers to get the botton link visible on mobile */}
                <div className='filler'></div>
            </div>
        </div>
    </>)
}