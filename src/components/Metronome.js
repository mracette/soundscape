/* eslint-disable */ 

// libs
import React, { useContext, useEffect, useRef } from 'react';
import anime from 'animejs/lib/anime.es.js';

// contexts
import { ApplicationAudioContext } from '../contexts/ApplicationAudioContext';

// styles
import '../styles/components/Metronome.scss';

const Metronome = () => {

    const { transport } = useContext(ApplicationAudioContext);

    const timeSignature = 4;
    const bpm = 92;
    const beatDuration = 60 * 1000 / bpm;
    const subBeatDuration = beatDuration / 100;
    const barDuration = beatDuration * timeSignature;
    const subBarDuration = barDuration / 100;

    const beatsRef = useRef(null);
    const barsRef = useRef(null);

    const beatAnimation = (target) => {
        return {
            targets: target,
            opacity: [
                { value: 1, duration: subBeatDuration, easing: 'easeOutCubic'},
                { value: .25, duration: beatDuration - subBeatDuration, easing: 'easeOutCubic' },
            ]
        }
    }

    const barAnimation = (target) => {
        return {
            targets: target,
            opacity: [
                { value: 1, duration: subBarDuration, easing: 'linear'},
                { value: .25, duration: barDuration - subBarDuration, easing: 'linear'},
            ]
        }
    }

    useEffect(() => {

        let beatIndex = 0;
        let barIndex = 0;

        transport.scheduleRepeat(() => {
            const currentBeat = beatsRef.current.children[beatIndex];
            anime(beatAnimation(currentBeat));
            beatIndex = (beatIndex + 1) % timeSignature;
        }, "0:1:0")

        transport.scheduleRepeat(() => {
            const currentBar = barsRef.current.children[barIndex];
            anime(barAnimation(currentBar));
            barIndex = (barIndex + 1) % 4;
        }, "1:0:0")


    }, []);

    return (
        <div id = 'metronome'>
            <div id = 'beats' ref = {beatsRef}>
                <div id = 'beat-1' className = 'beat'/>
                <div id = 'beat-2' className = 'beat'/>
                <div id = 'beat-3' className = 'beat'/>
                <div id = 'beat-4' className = 'beat'/>
            </div>
            <div id = 'bars' ref = {barsRef}>
                <div id = 'bar-1' className = 'bar'/>
                <div id = 'bar-2' className = 'bar'/>
                <div id = 'bar-3' className = 'bar'/>
                <div id = 'bar-4' className = 'bar'/>
            </div>
        </div>
    );

}

export default Metronome;