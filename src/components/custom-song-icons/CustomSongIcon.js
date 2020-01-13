// libs
import React from 'react';
import { CanvasCoordinates } from '../../utils/crco-utils.module';

// components
import { Canvas } from '../Canvas';

// context
import { LandingPageContext } from '../../contexts/contexts';

// styles
import '../../styles/components/LandingPage.scss';

const speed = .001;

export function CustomSongIcon(props) {

    const canvasRef = React.useRef(null);
    const contextRef = React.useRef();
    const cycleRef = React.useRef(0);
    const timeRef = React.useRef(0);
    const animationRef = React.useRef();
    const coordsRef = React.useRef();

    const { dispatch } = React.useContext(LandingPageContext);
    const { animate, id } = props;

    React.useEffect(() => {

        const updateCanvas = (time, loop, reset) => {

            const delta = reset ? 0 : time - timeRef.current;
            cycleRef.current += delta * speed;
            timeRef.current = time;

            contextRef.current.clearRect(0, 0, coordsRef.current.getWidth(), coordsRef.current.getHeight());
            contextRef.current.lineWidth = coordsRef.current.getWidth() / 128;
            contextRef.current.strokeStyle = '#f6f2d5';

            animate(
                contextRef.current,
                cycleRef.current,
                coordsRef.current,
            );

            if (loop) {
                animationRef.current = window.requestAnimationFrame((time) => updateCanvas(time, true));
            }

        }

        const handleSetSelected = () => dispatch({ type: props.name });
        const handleUnsetSelected = () => dispatch({ type: null });

        const beginAnimation = () => {
            animationRef.current = window.requestAnimationFrame((time) => updateCanvas(time, true, true));
        }

        const stopAnimation = () => {
            window.cancelAnimationFrame(animationRef.current);
        }

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

    }, [dispatch, props.name, animate]);

    return React.useMemo(() => {
        return <Canvas
            id={id}
            className="custom-song-icon"
            onLoad={(canvas) => canvasRef.current = canvas}
        />
    }, [id]);

}