// libs
import React, { useState, useEffect, useRef } from 'react';
import { useTraceUpdate } from '../../hooks/useTraceUpdate';
import { CanvasCoordinates } from '../../utils/crco-utils.module';

// components
import { Canvas } from '../Canvas';

// styles
import '../../styles/components/LandingPage.scss';

const speed = .001;

export function CustomSongIcon(props) {

    useTraceUpdate(props);

    const canvasRef = useRef(null);
    const contextRef = useRef();
    const cycleRef = useRef(0);
    const timeRef = useRef(0);
    const animationRef = useRef();
    const coordsRef = useRef();

    const updateCanvas = (time, loop, reset) => {

        console.log('updating');

        const delta = reset ? 0 : time - timeRef.current;
        cycleRef.current += delta * speed;
        timeRef.current = time;

        contextRef.current.clearRect(0, 0, coordsRef.current.getWidth(), coordsRef.current.getHeight());
        contextRef.current.lineWidth = coordsRef.current.getWidth() / 128;
        contextRef.current.strokeStyle = '#f6f2d5';

        props.animate(
            contextRef.current,
            cycleRef.current,
            coordsRef.current,
            props.options
        );

        if (loop) {
            animationRef.current = window.requestAnimationFrame((time) => updateCanvas(time, true));
        }

    }

    useEffect(() => {

        canvasRef.current.addEventListener('mouseover', () => {
            animationRef.current = window.requestAnimationFrame((time) => updateCanvas(time, true, true));
        });

        canvasRef.current.addEventListener('mouseout', () => {
            window.cancelAnimationFrame(animationRef.current);
        });

        // canvasRef.current.addEventListener('resize', () => updateCanvas(timeRef.current, false, false));

        coordsRef.current = new CanvasCoordinates({ canvas: canvasRef.current, padding: .02 });;
        contextRef.current = canvasRef.current.getContext('2d');
        updateCanvas(0, false, false);

        return () => window.cancelAnimationFrame(animationRef.current);

    }, []);

    useEffect(() => {

        console.log('new listener');

        if (props.handleSetSelected) {
            canvasRef.current.addEventListener('mouseover', props.handleSetSelected);
            canvasRef.current.addEventListener('mouseout', props.handleUnsetSelected);
        }

        updateCanvas(timeRef.current, false, false);

        return () => {
            canvasRef.current.removeEventListener('mouseover', props.handleSetSelected);
            canvasRef.current.removeEventListener('mouseout', props.handleUnsetSelected);
        }

    }, [props.handleSetSelected, props.handleUnsetSelected]);

    return React.useMemo(() => {
        return <Canvas
            id={props.id}
            className="custom-song-icon"
            onLoad={(canvas) => {
                // only use the canvas reference on the first render
                if (canvasRef.current === null) {
                    canvasRef.current = canvas;
                }
            }}
        />
    }, []);

}