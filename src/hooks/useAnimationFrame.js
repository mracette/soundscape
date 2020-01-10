// libs
import React from 'react';

export const useAnimationFrame = (render) => {

    const requestRef = React.useRef();
    const previousTimeRef = React.useRef();

    const animate = (time) => {
        if (previousTimeRef.current != undefined) {
            const delta = time - previousTimeRef.current;
            render({ delta, time });
        }
        previousTimeRef.current = time;
        requestRef.current = window.requestAnimationFrame(animate);
    }

    React.useEffect(() => {

        requestRef.current = window.requestAnimationFrame(animate);
        return () => window.cancelAnimationFrame(requestRef.current);

    }, []);

}