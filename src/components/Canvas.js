// libs
import React, { useRef, useEffect } from 'react';

export const Canvas = (props) => {

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

        // trigger the resize callback
        props.resize !== undefined && props.onResize !== undefined && props.onResize(canvasRef.current);

    }

    useEffect(() => {

        setCanvasSize();

        props.resize !== undefined && window.addEventListener('resize', setCanvasSize);

        // trigger the onload callback
        props.onLoad !== undefined && props.onLoad(canvasRef.current);

        return () => props.resize !== undefined && window.removeEventListener('resize', setCanvasSize);

    }, [setCanvasSize, props])

    return (
        <canvas
            id={props.id}
            className={props.className}
            ref={canvasRef}
        />
    );

}