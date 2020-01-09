// libs
import React, { useEffect, useRef } from 'react';
import { useTraceUpdate } from '../../hooks/useTraceUpdate';
import { CanvasCoordinates } from '../../utils/crco-utils.module';

// components
import { Canvas } from '../Canvas';

// context
import { landingPageDispatch } from '../LandingPage';

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
    const dispatch = React.useContext(landingPageDispatch);

    const handleSetSelected = () => dispatch({ type: props.name });
    const handleUnsetSelected = () => dispatch({ type: null });

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

    const beginAnimation = () => {
        animationRef.current = window.requestAnimationFrame((time) => updateCanvas(time, true, true));
    }

    const stopAnimation = () => {
        window.cancelAnimationFrame(animationRef.current);
    }

    useEffect(() => {

        // add listeners
        canvasRef.current.addEventListener('mouseover', beginAnimation);
        canvasRef.current.addEventListener('mouseover', handleSetSelected);
        canvasRef.current.addEventListener('mouseout', stopAnimation);
        canvasRef.current.addEventListener('mouseout', handleUnsetSelected);

        // set up canvas/coords and initialize drawing
        coordsRef.current = new CanvasCoordinates({ canvas: canvasRef.current, padding: .02 });;
        contextRef.current = canvasRef.current.getContext('2d');
        updateCanvas(0, false, false);

        // cleanup
        return () => {
            stopAnimation();
            canvasRef.current.removeEventListener('mouseover', beginAnimation);
            canvasRef.current.removeEventListener('mouseover', handleSetSelected);
            canvasRef.current.removeEventListener('mouseout', stopAnimation);
            canvasRef.current.removeEventListener('mouseout', handleUnsetSelected);
        }

    }, []);

    return React.useMemo(() => {
        return <Canvas
            id={props.id}
            className="custom-song-icon"
            onLoad={(canvas) => canvasRef.current = canvas}
        />
    }, []);

}