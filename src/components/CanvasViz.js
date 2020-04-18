// libs
import React from 'react';

// scenes
import { Moonrise } from '../viz/scenes/moonrise/Moonrise';
import { Mornings } from '../viz/scenes/mornings/Mornings';
import { Mire } from '../viz/scenes/mire/Mire';

// components
import { LoadingScreen } from '../components/LoadingScreen';

// context
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';
import { ThemeContext } from '../contexts/contexts';

// utils
import { cinematicResize, addWindowListeners, removeWindowListeners } from '../utils/jsUtils';

// styles
import '../styles/components/CanvasViz.scss';

export const CanvasViz = () => {

    const { spectrumFunction } = React.useContext(ThemeContext);
    const { id, groups, bpm } = React.useContext(SongContext);
    const { players, analysers, dispatch, isLoading, pauseVisuals } = React.useContext(MusicPlayerContext);
    const { flags } = React.useContext(TestingContext);

    const canvasRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    React.useEffect(() => {
        sceneRef.current && (sceneRef.current.pauseVisuals = pauseVisuals);
    }, [pauseVisuals])

    // tell the scene which players are active so it can render elements selectively
    React.useEffect(() => {
        if (sceneRef.current) {
            const playerState = {}
            groups.forEach((g) => {
                playerState[g.name] = players.filter((p) => p.groupName === g.name && p.playerState === 'active').length > 0;
            });
            sceneRef.current.playerState = playerState;
        }
    }, [groups, players])

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
                case 'mire':
                    if (flags.showVisuals) {
                        newScene = new Mire(
                            canvasRef.current,
                            null,
                            () => dispatch({ type: 'setIsLoading', payload: false }), {
                        }
                        )
                        sceneRef.current = newScene;
                    }
                    break;
                default:
                    throw new Error('Song not found');
            }

            let resizeFunction;

            if (flags.showVisuals) {
                if(newScene.resizeMethod === 'cinematic') {
                    resizeFunction = cinematicResize(canvasRef.current);
                    resizeFunction();
                    addWindowListeners(resizeFunction);
                }
                addWindowListeners(sceneRef.current.onWindowResize);
            }

            return () => {
                if (flags.showVisuals) {
                    newScene.stop();
                    newScene.disposeAll(newScene.scene);
                    if(newScene.resizeMethod === 'cinematic') {
                        resizeFunction();
                    }
                    removeWindowListeners(sceneRef.current.onWindowResize);
                }
            }

        }
    }, [bpm, groups, spectrumFunction, flags.showVisuals, id, analysers, dispatch]);

    return (<>
        {isLoading && <LoadingScreen />}
        <div id='canvas-viz-parent' className='fullscreen'>
            <canvas id='canvas-viz' ref={canvasRef}></canvas>
        </div>
    </>)

}