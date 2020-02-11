// libs
import React from 'react';
import { boundedSin } from 'crco-utils';

// components
import { CustomSongIcon } from './CustomSongIcon';

// styles
import '../../styles/components/LandingPage.scss';

const bsin = boundedSin(2, 0, 1, -1.5);

const animate = (context, cycle, coords) => {
    const panelWidth = coords.getWidth() / 8;
    const centerPoint = coords.nx(0) - panelWidth / 2;
    for (let i = 0; i < 5; i++) {
        const panelHeight = coords.getHeight() * (.6 - Math.abs(2 - i) * .1);
        context.beginPath();
        context.strokeRect(
            centerPoint - (2 - i) * panelWidth * bsin(cycle),
            coords.ny(-.6 + Math.abs(2 - i) * .1),
            panelWidth,
            panelHeight
        );
    }
}

export function MorningsIcon(props) {
    return (
        <CustomSongIcon
            name={props.name}
            id="custom-mornings-icon"
            animate={animate}
        />
    );
}