// libs
import React from 'react';
import { rotatePoint, TAU } from '../../utils/crco-utils.module';

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
            handleSetSelected={props.handleSetSelected}
            handleUnsetSelected={props.handleUnsetSelected}
            id="coming-soon-icon"
            animate={animate}
        />
    );
}