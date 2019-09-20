/* eslint-disable */ 

// libs
import React, { useEffect, useContext, useState, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

// context
import { MusicPlayerContext } from '../contexts/MusicPlayerContext';

// styles
import '../styles/components/ToggleButton.scss';

const ToggleButton = (props) => {

    const buttonRadius = 4;
    const buttonBorder = buttonRadius / 15;
    const buttonRadiusUnit = 'rem';
    const buttonRef = useRef(null);

    const [ player, setPlayer ] = useState(null);
    const [ playerState, setPlayerState ] = useState('stopped');
    const [ eventId, setEventId ] = useState(null);
    const [ svgAnimation, setSvgAnimation ] = useState(null);
    const [ buttonAnimation, setButtonAnimation ] = useState(null);
    
    const { premaster, tone, context, transport, songId, devMode } = useContext(MusicPlayerContext);

    useEffect(() => {
        // initialize the player associated with this button
        const audio = require(`../audio/${songId}/${props.name}.mp3`);
        const player = new tone.Player(audio);
        player.connect(premaster);
        player.loop = true;
        player.loopEnd = props.length;
        setPlayer(player);

    }, [])

    // triggered when the player starts from a stopped position
    const startPlayer = () => {
            setPlayerState('pending-start');

            const quantizedStartTime = devMode ? `@4n`: `@${props.quantizeLength}`;
            const quantizedStartSeconds = (transport.nextSubdivision(quantizedStartTime) - context.now()) * 1000;
            
            const startEvent = transport.schedule(() => {
                player.start();
                setPlayerState('active');
            }, quantizedStartTime);

            const svgAnimation = anime({
                targets: buttonRef.current.children[0], //svg
                strokeDashoffset: [0, 2 * Math.PI * (buttonRadius - buttonBorder / 2) + buttonRadiusUnit],
                duration: quantizedStartSeconds,
                easing: 'linear'
            });

            const buttonAnimation = anime({
                targets: buttonRef.current, // button
                backgroundColor: 'rgba(255,255,255, 0.3)',
                duration: quantizedStartSeconds,
                easing: 'easeInCubic'
            });

            setEventId(startEvent);
            setSvgAnimation(svgAnimation);
            setButtonAnimation(buttonAnimation);
    }

    // triggered when the player stops from an active position
    const stopPlayer = (override) => {
            setPlayerState('pending-stop');

            const quantizedStartTime = devMode ? `@4n`: `@${props.quantizeLength}`;
            const quantizedStartSeconds = (transport.nextSubdivision(quantizedStartTime) - context.now()) * 1000;
            
            const stopEvent = transport.schedule(() => {
                player.stop();
                setPlayerState('stopped');
            }, quantizedStartTime);

            const svgAnimation = anime({
                targets: buttonRef.current.children[0], //svg
                strokeDashoffset: [0, 2 * Math.PI * (buttonRadius - buttonBorder / 2) + buttonRadiusUnit],
                duration: quantizedStartSeconds,
                easing: 'linear',
                direction: 'reverse'
            });

            const buttonAnimation = anime({
                targets: buttonRef.current, // button
                backgroundColor: 'rgba(255, 255, 255, 0)',
                duration: quantizedStartSeconds,
                easing: 'easeInCubic'
            });

            setEventId(stopEvent);
            setSvgAnimation(svgAnimation);
            setButtonAnimation(buttonAnimation);

    }

    // triggered when a pending start is canceled
    const pendingStop = (override) => {
            setPlayerState('pending-stop');

            const quantizedStartTime = devMode ? `@4n`: `@${props.quantizeLength}`;

            // remove the pending-stop event from the queue
            transport.clear(eventId);

            // reverse the current animations
            svgAnimation.reverse();
            buttonAnimation.reverse();

            const pendingStopEvent = transport.schedule(() => {
                player.stop();
                setPlayerState('stopped');
            }, quantizedStartTime);

            setEventId(pendingStopEvent);
    }

    const clickAction = () => {
        switch(playerState) {
            case 'stopped': startPlayer(); break;
            case 'active': stopPlayer(); break;
            case 'pending-start': pendingStop(); break;
            default: break;
        }
    }

    return (
        <button 
            type = 'button'
            className = 'toggle-button'
            ref = { buttonRef }
            onClick = { clickAction }
            style = {{
                height: buttonRadius * 2 + buttonRadiusUnit,
                width: buttonRadius * 2 + buttonRadiusUnit,
                marginRight: buttonRadius / 4 + buttonRadiusUnit
            }}
        >
            <svg 
                className = 'svg'
                width = { 2 * buttonRadius + buttonRadiusUnit }
                height = { 2 * buttonRadius + buttonRadiusUnit }
            >
                <circle 
                    className = 'svg-circle'
                    cx = { buttonRadius + buttonRadiusUnit }
                    cy = { buttonRadius + buttonRadiusUnit }
                    r = { buttonRadius - buttonBorder / 2 + buttonRadiusUnit }
                    style = {{
                        strokeWidth: buttonBorder + buttonRadiusUnit,
                        strokeDasharray: 2 * Math.PI * (buttonRadius - buttonBorder / 2) + buttonRadiusUnit
                    }}
                >
                </circle>
            </svg>
        </button>
    );

}

export default ToggleButton;