// libs
import React from 'react';
import { TAU, rotatePoint, boundedSin } from '../../utils/crco-utils.module';

// components
import { CustomSongIcon } from './CustomSongIcon';

// styles
import '../../styles/components/LandingPage.scss';

const count = 5;
const bsin = boundedSin(2, 0, 1, -1.5);

const animate = (context, cycle, coords, options) => {
    const panelWidth = coords.getWidth() / 8;
    const centerPoint = coords.nx(0) - coords.getWidth() / 10;
    for (let i = 0; i < options.count; i++) {
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

export function Mornings() {
    return (
        <CustomSongIcon
            id="custom-moonrise-icon"
            animate={animate}
            options={{ count }}
        />
    );
}