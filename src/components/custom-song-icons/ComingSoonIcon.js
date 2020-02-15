// libs
import React from 'react';
import { rotatePoint, TAU } from 'crco-utils';

// components
import { CustomSongIcon } from './CustomSongIcon';

// styles
import '../../styles/components/LandingPage.scss';

const animate = (context, cycle, coords) => {
    const count = 4;
    for (let i = 0; i < count; i++) {
        context.beginPath();
        context.arc(
            coords.nx(rotatePoint(-.5, 0, 0, 0, cycle + TAU * i / count).x),
            coords.ny(rotatePoint(0, 0, 0, 0, cycle + TAU * i / count).y),
            coords.getWidth() / 48,
            0, TAU
        );
        context.stroke();
    }
}

export function ComingSoonIcon(props) {
    return (
        <CustomSongIcon
            dispatch={props.dispatch}
            name={props.name}
            id="coming-soon-icon"
            animate={animate}
            listen={true}
        />
    );
}