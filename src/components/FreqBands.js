/* eslint-disable */ 

// libs
import React, { useEffect, useRef } from 'react';

// styles
import '../styles/components/FreqBands.scss';

const FreqBands = (props) => {

    const canvasRef = useRef(null);
    
    let canvasCtx, canvasWidth, canvasHeight, radius;

    const secondsPerBeat = 60 / props.bpm;
    const secondsPerBar = secondsPerBeat * props.timeSignature;

    useEffect(() => {
        init();
        draw();
    }, [])
    
    const init = () => {

        canvasCtx = canvasRef.current.getContext("2d");

        canvasRef.current.width = canvasRef.current.clientWidth;
        canvasRef.current.height = canvasRef.current.clientHeight;

        canvasWidth = canvasRef.current.width;
        canvasHeight = canvasRef.current.height;

        radius = canvasHeight / 3;

    }

    const draw = (time) => {

        // calculate cycle time 
        const cycleTime = (time / 1000) / (secondsPerBar * 4);

        // clear previous draw
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // get time domain data
        const dataArray = props.analyser.getFrequencyData();
        
        canvasCtx.beginPath();

        // map time domain data to canvas draw actions
        dataArray.map((d, i) => {
            
            canvasCtx.fillStyle = `rgba(255, 255, 255, ${v})`;
            
            const vol = (d / 255);
            const cx = canvasWidth / 2 + radius * Math.cos((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));
            const cy = canvasHeight / 2 + radius * Math.sin((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));

            canvasCtx.moveTo(cx, cy);

            canvasCtx.arc(
                cx,
                cy,
                vol * (canvasHeight / props.analyser.frequencyBinCount),
                0,
                Math.PI * 2
            );

            canvasCtx.fill();

        });

        // repeat
        requestAnimationFrame(draw);

    }

    return (
        <div id = 'freq-bands'>
            <canvas 
                id = 'freq-bands-canvas' 
                ref = {canvasRef}
            />
        </div>
    )

}

export default FreqBands;