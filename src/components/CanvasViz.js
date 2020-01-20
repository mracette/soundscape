// libs
import React from 'react';

// scenes
import { Moonrise } from '../viz/scenes/Moonrise';
import { Mornings } from '../viz/scenes/Mornings';

// components
import { Canvas } from '../components/Canvas';

// context
import { SongContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';

// styles
import '../styles/components/CanvasViz.scss';

export const CanvasViz = () => {

    const { id, groups } = React.useContext(SongContext);
    const { analysers } = React.useContext(MusicPlayerContext);
    const flagShowVisuals = React.useContext(TestingContext).flags.showVisuals;

    const canvasRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    React.useEffect(() => {
        if (groups.length === analysers.length) {
            switch (id) {
                case 'moonrise':
                    if (flagShowVisuals) {
                        sceneRef.current = new Moonrise(canvasRef.current, analysers);
                    }
                    break;
                case 'mornings':
                    if (flagShowVisuals) {
                        sceneRef.current = new Mornings(canvasRef.current);
                    }
                    break;
                default:
                    throw new Error('Song not found');
            }
        }
    }, [flagShowVisuals, id, analysers]);

    return (
        <Canvas
            id='canvas-viz'
            className='fullscreen'
            onLoad={(canvas) => canvasRef.current = canvas}
        />
    )

}