/* eslint-disable */ 

import React, { useEffect, useRef } from 'react';
//import Moonrise from '../viz/scenes/Moonrise';
import Mornings from '../viz/scenes/Mornings';

import '../styles/components/CanvasViz.scss';

const CanvasViz = (props) => {

    useEffect(() => {

        switch(props.config.id) {
            case 'moonrise':
                // new Moonrise(canvasRef.current);
                break;
                case 'mornings':
                new Mornings(canvasRef.current);
                break;
        }

        console.log(props.config.id);

    });

    const canvasRef = useRef(null);

    return (
        <canvas id = 'canvas-viz' className = 'fullscreen' ref = {canvasRef}/>
    )

}

export default CanvasViz;