// libs
import React from 'react';
import { boundedSin } from '../../utils/crco-utils.module';

// components
import { CustomSongIcon } from './CustomSongIcon';

// styles
import '../../styles/components/LandingPage.scss';

const bsin = boundedSin(2, 0, 1, -1.5);

const animate = (context, cycle, coords) => {
    const count = 5;
    const panelWidth = coords.getWidth() / 8;
    const centerPoint = coords.nx(0) - panelWidth / 2;
    for (let i = 0; i < count; i++) {
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
            handleSetSelected={props.handleSetSelected}
            id="custom-mornings-icon"
            animate={animate}
        />
    );
}