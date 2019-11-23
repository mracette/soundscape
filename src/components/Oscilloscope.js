/* eslint-disable */ 

// libs
import React, { useEffect, useRef } from 'react';

// styles
import '../styles/components/Oscilloscope.scss';

const Oscilloscope = (props) => {

    const canvasRef = useRef(null);
    let canvasCtx, canvasWidth, canvasHeight;

    useEffect(() => {

        canvasCtx = canvasRef.current.getContext("2d");
        
        canvasWidth = canvasRef.current.width;
        canvasHeight = canvasRef.current.height;

        canvasCtx.lineWidth = 6.5;
        canvasCtx.strokeStyle = props.spectrumFunction ? 
            props.spectrumFunction(props.index / props.groupCount) :
            'rgb(255, 255, 255)';

        draw();

    }, [])

    const draw = () => {

        // clear previous draw
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // get time domain data
        const dataArray = props.analyser.getTimeData();

        const sliceWidth = canvasWidth / (dataArray.length - 1);

        let x = 0;
        let prevX, prevY
        
        
        dataArray.map((d, i) => {

            canvasCtx.beginPath();

            if(props.gradient) {
                canvasCtx.strokeStyle = props.spectrumFunction(props.index / props.groupCount + i / (dataArray.length * props.groupCount));
            }

            const v = d / 128.0;

            const y = v * canvasHeight / 2;

            if(x === 0) {
                canvasCtx.moveTo(x, y);
            } else {
                canvasCtx.moveTo(prevX, prevY);
            }

            canvasCtx.lineTo(x, y);

            prevX = x;
            prevY = y;

            x += sliceWidth;
            
            canvasCtx.stroke();

        });

        requestAnimationFrame(draw);

    }

    return (
        <div id = 'oscilloscope'>
            <canvas 
                id = 'oscilloscope-canvas' ref = {canvasRef}/>
        </div>
    )

}

export default Oscilloscope;