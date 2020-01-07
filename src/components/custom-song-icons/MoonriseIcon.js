// libs
import React from 'react';
import { TAU, rotatePoint } from '../../utils/crco-utils.module';

// components
import { CustomSongIcon } from './CustomSongIcon';

// styles
import '../../styles/components/LandingPage.scss';

const count = 5;
const animate = (context, cycle, coords, options) => {
    for (let i = 0; i < options.count; i++) {
        context.beginPath();
        context.arc(
            coords.nx(rotatePoint(.2, 0, 0, 0, cycle + TAU * i / count).x),
            coords.ny(rotatePoint(.2, 0, 0, 0, cycle + TAU * i / count).y),
            coords.getWidth() / 4,
            0, TAU
        );
        context.stroke();
    }
}

export function MoonriseIcon(props) {
    return (
        <CustomSongIcon
            handleSetSelected={props.handleSetSelected}
            id="custom-moonrise-icon"
            animate={animate}
            options={{ count }}
        />
    );
}