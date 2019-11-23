/* eslint-disable */

// libs
import React, { useEffect, useRef, useContext } from 'react';
//import Moonrise from '../viz/scenes/Moonrise';
import Mornings from '../viz/scenes/Mornings';

// context
import MusicPlayerContext from '../contexts/MusicPlayerContext'

// styles
import '../styles/components/CanvasViz.scss';

const CanvasViz = (props) => {

    const { id } = useContext(MusicPlayerContext);

    useEffect(() => {

        switch (id) {
            case 'moonrise':
                // new Moonrise(canvasRef.current);
                break;
            case 'mornings':
                new Mornings(canvasRef.current);
                break;
        }

    }, []);

    const canvasRef = useRef(null);

    return (
        <canvas id='canvas-viz' className='fullscreen' ref={canvasRef} />
    )

}

export default CanvasViz;