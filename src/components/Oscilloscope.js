// libs
import React from 'react';

// components
import { Canvas } from '../components/Canvas';

// context
import { ThemeContext } from '../contexts/contexts';

// hooks
import { useAnimationFrame } from '../hooks/useAnimationFrame';

// styles
import '../styles/components/Oscilloscope.scss';

export const Oscilloscope = (props) => {

    const canvasRef = React.useRef(null);
    const contextRef = React.useRef(null);
    const { spectrumFunction } = React.useContext(ThemeContext);

    const render = React.useCallback((canvas, context) => {

        contextRef.current.lineWidth = canvas.height / 20;

        // clear previous draw
        context.clearRect(0, 0, canvas.width, canvas.height);

        // get time domain data
        const dataArray = props.analyser.getTimeData();

        const sliceWidth = canvas.width / (dataArray.length - 1);

        let x = 0;
        let prevX, prevY


        dataArray.forEach((d, i) => {

            context.beginPath();

            if (props.gradient) {
                context.strokeStyle = spectrumFunction(props.index / props.groupCount + i / (dataArray.length * props.groupCount));
            }

            const v = d / 128.0;

            const y = v * canvas.height / 2;

            if (x === 0) {
                context.moveTo(x, y);
            } else {
                context.moveTo(prevX, prevY);
            }

            context.lineTo(x, y);

            prevX = x;
            prevY = y;

            x += sliceWidth;

            context.stroke();

        });

    }, [props]);

    useAnimationFrame(() => render(canvasRef.current, contextRef.current));

    return React.useMemo(() => (
        <div id='oscilloscope'>
            <Canvas
                id='oscilloscope-canvas'
                onLoad={(canvas) => {
                    canvasRef.current = canvas;
                    contextRef.current = canvas.getContext('2d');
                }}
            />
        </div>
    ), []);

}