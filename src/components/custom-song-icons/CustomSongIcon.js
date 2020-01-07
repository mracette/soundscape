// libs
import React, { useState, useEffect, useRef } from 'react';
import { CanvasCoordinates } from '../../utils/crco-utils.module';

// components
import { Canvas } from '../Canvas';

// styles
import '../../styles/components/LandingPage.scss';

const speed = .001;

export function CustomSongIcon(props) {

    const canvasRef = useRef(null);
    const contextRef = useRef();
    const cycleRef = useRef(0);
    const timeRef = useRef(0);
    const animationRef = useRef();
    const coordsRef = useRef();

    const updateCanvas = (time, loop, reset) => {

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
        coordsRef.current = new CanvasCoordinates({ canvas: canvasRef.current, padding: .02 });;
        contextRef.current = canvasRef.current.getContext('2d');
        updateCanvas(0, false, false);
        return () => window.cancelAnimationFrame(animationRef.current);
    }, []);

    useEffect(() => {
        if (props.handleSetSelected) {
            canvasRef.current.addEventListener('mouseover', () => props.handleSetSelected());
            canvasRef.current.addEventListener('mouseout', () => props.handleSetSelected(null));
        }
    }, [props.handleSetSelected]);

    return React.useMemo(() => {
        return <Canvas
            id={props.id}
            className="custom-song-icon"
            onLoad={(canvas) => {
                // only use the canvas reference on the first render
                if (canvasRef.current === null) {
                    console.log('load new canvas');
                    canvasRef.current = canvas;
                }
            }}
        />
    }, []);

}