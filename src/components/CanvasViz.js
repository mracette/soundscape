// libs
import React from 'react';

// scenes
import { Moonrise } from '../viz/scenes/moonrise/Moonrise';
import { Mornings } from '../viz/scenes/mornings/Mornings';

// components
import { LoadingScreen } from '../components/LoadingScreen';

// context
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';
import { ThemeContext } from '../contexts/contexts';

// styles
import '../styles/components/CanvasViz.scss';

export const CanvasViz = () => {

    const { spectrumFunction } = React.useContext(ThemeContext);
    const { id, groups, bpm } = React.useContext(SongContext);
    const { analysers, dispatch, isLoading, pauseVisuals } = React.useContext(MusicPlayerContext);
    const { flags } = React.useContext(TestingContext);

    const canvasRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    React.useEffect(() => {
        console.log(pauseVisuals);
        if (sceneRef.current) {
            sceneRef.current.pauseVisuals = pauseVisuals;
            console.log(sceneRef.current);
        }
    }, [pauseVisuals])

    React.useEffect(() => {
        if (groups.length === analysers.length) {

            let newScene;

            switch (id) {
                case 'moonrise':
                    if (flags.showVisuals) {
                        newScene = new Moonrise(
                            canvasRef.current,
                            analysers,
                            () => dispatch({ type: 'setIsLoading', payload: false })
                        );
                        sceneRef.current = newScene;
                    } else {
                        dispatch({ type: 'setIsLoading', payload: false });
                    }
                    break;
                case 'mornings':
                    if (flags.showVisuals) {
                        newScene = new Mornings(
                            canvasRef.current,
                            analysers,
                            () => dispatch({ type: 'setIsLoading', payload: false }), {
                            spectrumFunction,
                            bpm
                        });
                        sceneRef.current = newScene
                    } else {
                        dispatch({ type: 'setIsLoading', payload: false });
                    }
                    break;
                default:
                    throw new Error('Song not found');
            }

            if (flags.showVisuals) {
                window.addEventListener('resize', sceneRef.current.onWindowResize);
                window.addEventListener('orientationchange', sceneRef.current.onWindowResize);
                window.addEventListener('fullscreenchange', sceneRef.current.onWindowResize);
                window.visualViewport && (window.visualViewport.addEventListener('scroll', sceneRef.current.onWindowResize));
                window.visualViewport && (window.visualViewport.addEventListener('resize', sceneRef.current.onWindowResize));
            }

            return () => {
                if (flags.showVisuals) {
                    newScene.stop();
                    newScene.disposeAll(newScene.scene);
                    window.removeEventListener('resize', sceneRef.current.onWindowResize);
                    window.removeEventListener('orientationchange', sceneRef.current.onWindowResize);
                    window.removeEventListener('fullscreenchange', sceneRef.current.onWindowResize);
                    window.visualViewport && (window.visualViewport.removeEventListener('scroll', sceneRef.current.onWindowResize));
                    window.visualViewport && (window.visualViewport.removeEventListener('resize', sceneRef.current.onWindowResize));
                }
            }

        }
    }, [bpm, groups, spectrumFunction, flags.showVisuals, id, analysers, dispatch]);

    return (<>
        {isLoading && <LoadingScreen />}
        <canvas id='canvas-viz' className='fullscreen' ref={canvasRef}></canvas>
    </>)

}