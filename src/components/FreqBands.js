// libs
import React from 'react';

// components
import { Canvas } from '../components/Canvas';

// hooks
import { useAnimationFrame } from '../hooks/useAnimationFrame';

// contexts
import { ThemeContext } from '../contexts/ThemeContext';
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// styles
import '../styles/components/FreqBands.scss';

export const FreqBands = (props) => {

    const { spectrumFunction } = React.useContext(ThemeContext);
    const { bpm, timeSignature } = React.useContext(MusicPlayerContext);

    const secondsPerBar = 60 / bpm * timeSignature;

    const canvasRef = React.useRef(null);
    const contextRef = React.useRef(null);

    const render = React.useCallback((canvas, context, time) => {

        const radius = canvas.height / 2 - (canvas.height / props.analyser.frequencyBinCount);

        // calculate cycle time 
        const cycleTime = (time / 1000) / (secondsPerBar * 4);

        // clear previous draw
        context.clearRect(0, 0, canvas.height, canvas.height);

        // get time domain data
        const dataArray = props.analyser.getFrequencyData();

        // map time domain data to canvas draw actions
        dataArray.forEach((d, i) => {

            const vol = (d / 255);
            const cx = canvas.width / 2 + radius * Math.cos((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));
            const cy = canvas.height / 2 + radius * Math.sin((i / props.analyser.frequencyBinCount * 2 * Math.PI + (cycleTime * Math.PI * 2)));

            context.beginPath();

            context.fillStyle = spectrumFunction(i / props.analyser.frequencyBinCount);

            context.globalAlphs = vol;

            context.moveTo(cx, cy);

            context.arc(
                cx,
                cy,
                (canvas.height / props.analyser.frequencyBinCount) * vol,
                0,
                Math.PI * 2
            );

            context.fill();

        });

    }, [props, spectrumFunction, secondsPerBar]);

    useAnimationFrame((t) => render(canvasRef.current, contextRef.current, t.time))

    return React.useMemo(() => (
        <div id='freq-bands'>
            <Canvas
                id='freq-bands-canvas'
                onLoad={(canvas) => {
                    canvasRef.current = canvas;
                    contextRef.current = canvas.getContext('2d');
                }}
            />
        </div>
    ), []);

}