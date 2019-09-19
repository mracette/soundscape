/* eslint-disable */ 

// libs
import React, { useContext, useEffect, useRef } from 'react';

// contexts
import { ApplicationAudioContext } from '../contexts/ApplicationAudioContext';

// styles
import '../styles/components/Oscilloscope.scss';

const Oscilloscope = (props) => {

    const canvasRef = useRef(null);
    let canvasCtx, canvasWidth, canvasHeight;

    useEffect(() => {

        canvasCtx = canvasRef.current.getContext("2d");
        canvasWidth = canvasRef.current.width;
        canvasHeight = canvasRef.current.height;

        canvasCtx.lineWidth = 3;
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'
        canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

        draw();

    }, [])

    const draw = () => {

        // clear previous draw
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // get time domain data
        const dataArray = props.analyser.getTimeData();

        const sliceWidth = canvasWidth / (dataArray.length - 1);
        let x = 0;
        
        canvasCtx.beginPath();

        dataArray.map((d, i) => {
            const v = d / 128.0;
            const y = v * canvasHeight / 2;
            if(i === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        });

        canvasCtx.stroke();

        requestAnimationFrame(draw);

    }

    return (
        <div id = 'oscilloscope'>
            <canvas id = 'oscilloscope-canvas' ref = {canvasRef}/>
        </div>
    )

}

export default Oscilloscope;