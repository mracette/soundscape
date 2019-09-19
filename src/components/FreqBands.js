/* eslint-disable */ 

// libs
import React, { useEffect, useRef } from 'react';

// styles
import '../styles/components/FreqBands.scss';

const FreqBands = (props) => {

    const lowEndDamping = 0.4;
    const canvasRef = useRef(null);
    let canvasCtx, canvasWidth, canvasHeight;

    useEffect(() => {
        init();
        draw();
    }, [])
    
    const init = () => {

        canvasCtx = canvasRef.current.getContext("2d");
        canvasWidth = canvasRef.current.width;
        canvasHeight = canvasRef.current.height;
    
        canvasCtx.lineWidth = 3;
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'

    }

    const draw = () => {

        // clear previous draw
        canvasCtx.fillStyle = 'rgba(0, 0, 0, 0)'
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
        canvasCtx.fillStyle = 'rgba(255, 255, 255, 1)'

        // get time domain data
        const dataArray = props.analyser.getFrequencyData();

        const sliceWidth = canvasWidth / props.analyser.frequencyBinCount;
        let x = 0;
        
        canvasCtx.beginPath();

        dataArray.map((d, i) => {
            const vol = canvasHeight * (d / 255);
            const damping = (1 - i / props.analyser.frequencyBinCount) * lowEndDamping;
            const v = vol * (1 - damping);
            canvasCtx.fillRect(x, canvasHeight / 2 - v / 2, sliceWidth, v);
            x += sliceWidth;
        });

        canvasCtx.stroke();

        requestAnimationFrame(draw);

    }

    return (
        <div id = 'freq-bands'>
            <canvas id = 'freq-bands-canvas' ref = {canvasRef}/>
        </div>
    )

}

export default FreqBands;