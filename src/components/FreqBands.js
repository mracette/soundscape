/* eslint-disable */

// libs
import React, { useEffect, useRef, useContext } from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';

// contexts
import LayoutContext from '../contexts/LayoutContext';
import ThemeContext from '../contexts/ThemeContext';
import MusicPlayerContext from '../contexts/MusicPlayerContext';

// styles
import '../styles/components/FreqBands.scss';

const FreqBands = (props) => {

    const { vw, vh } = useContext(LayoutContext);
    const { spectrumFunction } = useContext(ThemeContext);
    const { bpm, timeSignature } = useContext(MusicPlayerContext);

    const canvasRef = useRef(null);

    let canvasCtx, canvasWidth, canvasHeight, radius;

    const secondsPerBeat = 60 / bpm;
    const secondsPerBar = secondsPerBeat * timeSignature;

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

        radius = canvasHeight / 2 - (canvasHeight / props.analyser.frequencyBinCount);

    }

    const draw = (time) => {

        // calculate cycle time 
        const cycleTime = (time / 1000) / (secondsPerBar * 4);

        // clear previous draw
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);

        // get time domain data
        const dataArray = props.analyser.getFrequencyData();

        // map time domain data to canvas draw actions
        dataArray.map((d, i) => {

            const vol = (d / 255);
            const cx = canvasWidth / 2 + radius * Math.cos((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));
            const cy = canvasHeight / 2 + radius * Math.sin((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));

            canvasCtx.beginPath();

            canvasCtx.fillStyle = spectrumFunction(i / props.analyser.frequencyBinCount);

            canvasCtx.globalAlphs = vol;

            canvasCtx.moveTo(cx, cy);

            canvasCtx.arc(
                cx,
                cy,
                (canvasHeight / props.analyser.frequencyBinCount) * vol,
                0,
                Math.PI * 2
            );

            canvasCtx.fill();

        });

        // repeat
        requestAnimationFrame(draw);

    }

    return (
        <div
            id='freq-bands'
            style={{
                top: 1.5 * vh,
                left: 1.5 * vh
            }}
        >
            <canvas
                id='freq-bands-canvas'
                style={{
                    width: 9 * vh,
                    height: 9 * vh,
                }}
                ref={canvasRef}
            />
        </div>
    )

}

export default FreqBands;