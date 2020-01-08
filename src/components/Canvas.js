// libs
import React, { useRef, useEffect } from 'react';

function useTraceUpdate(props) {
    const prev = useRef(props);
    useEffect(() => {
        const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
            if (prev.current[k] !== v) {
                ps[k] = [prev.current[k], v];
            }
            return ps;
        }, {});
        if (Object.keys(changedProps).length > 0) {
            console.log('Changed props:', changedProps);
        }
        prev.current = props;
    });
}

export const Canvas = (props) => {

    useTraceUpdate(props);

    const pixelRatio = typeof document !== 'undefined' ? window.devicePixelRatio : 1;

    const canvasRef = useRef(null);

    const setCanvasSize = () => {

        // resize to device pixel ratio
        canvasRef.current.clientWidth !== 0 && (canvasRef.current.width = pixelRatio * canvasRef.current.clientWidth);

        // height depends on props.makeSquare
        if (props.makeSquare) {
            canvasRef.current.clientHeight !== 0 && (canvasRef.current.height = pixelRatio * canvasRef.current.clientWidth);
        } else {
            canvasRef.current.clientHeight !== 0 && (canvasRef.current.height = pixelRatio * canvasRef.current.clientHeight);
        }

        console.log(canvasRef.current.width, canvasRef.current.height);

        // trigger the resize callback
        props.onResize !== undefined && props.onResize(canvasRef.current);

    }

    useEffect(() => {

        setCanvasSize();

        window.addEventListener('resize', setCanvasSize);

        // trigger the onload callback
        props.onLoad !== undefined && props.onLoad(canvasRef.current);

        return () => window.removeEventListener('resize', setCanvasSize);

    }, [setCanvasSize])

    return (
        <canvas
            id={props.id}
            className={props.className}
            ref={canvasRef}
        />
    );

}