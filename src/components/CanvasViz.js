// libs
import React from 'react';
import Moonrise from '../viz/scenes/Moonrise';
import Mornings from '../viz/scenes/Mornings';

// components
import { Canvas } from '../components/Canvas';

// context
import MusicPlayerContext from '../contexts/MusicPlayerContext';
import TestingContext from '../contexts/TestingContext';

// styles
import '../styles/components/CanvasViz.scss';

export const CanvasViz = () => {

    const { id } = React.useContext(MusicPlayerContext);
    const flagShowVisuals = React.useContext(TestingContext).flags.showVisuals;

    const canvasRef = React.useRef(null);
    const sceneRef = React.useRef(null);

    React.useEffect(() => {
        switch (id) {
            case 'moonrise':
                if (flagShowVisuals) {
                    sceneRef.current = new Moonrise(canvasRef.current);
                }
                break;
            case 'mornings':
                if (flagShowVisuals) {
                    sceneRef.current = new Mornings(canvasRef.current);
                }
                break;
        }
    }, [flagShowVisuals, id]);

    return (
        <Canvas
            id='canvas-viz'
            className='fullscreen'
            onLoad={(canvas) => canvasRef.current = canvas}
        />
    )

}