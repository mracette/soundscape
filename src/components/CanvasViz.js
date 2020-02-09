// libs
import React from 'react';

// scenes
import { Moonrise } from '../viz/scenes/moonrise/Moonrise';
import { Mornings } from '../viz/scenes/mornings/Mornings';

// components
import { Canvas } from '../components/Canvas';
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
    const { analysers } = React.useContext(MusicPlayerContext);
    const flagShowVisuals = React.useContext(TestingContext).flags.showVisuals;

    const [loading, setLoading] = React.useState(true);

    const canvasRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    React.useEffect(() => {
        if (groups.length === analysers.length) {

            let newScene;

            switch (id) {
                case 'moonrise':
                    if (flagShowVisuals) {
                        newScene = new Moonrise(canvasRef.current, analysers, () => setLoading(false));
                        sceneRef.current = newScene;
                    }
                    break;
                case 'mornings':
                    if (flagShowVisuals) {
                        newScene = new Mornings(canvasRef.current, analysers, () => setLoading(false), {
                            spectrumFunction,
                            bpm
                        });
                        sceneRef.current = newScene
                    }
                    break;
                default:
                    throw new Error('Song not found');
            }

            if (flagShowVisuals) {
                window.addEventListener('resize', sceneRef.current.onWindowResize);
                window.addEventListener('orientationchange', sceneRef.current.onWindowResize);
                window.addEventListener('fullscreenchange', sceneRef.current.onWindowResize);
            }

            return () => {
                if (flagShowVisuals) {
                    newScene.stop();
                    newScene.disposeAll(newScene.scene);
                }
            }

        }
    }, [bpm, groups, spectrumFunction, flagShowVisuals, id, analysers]);

    return (<>
        {loading && <LoadingScreen />}
        <canvas id='canvas-viz' className='fullscreen' ref={canvasRef}></canvas>
        {/* <Canvas
            id='canvas-viz'
            className='fullscreen'
            onLoad={(canvas) => canvasRef.current = canvas}
        /> */}
    </>)

}