import React, { useEffect } from 'react';
import anime from 'animejs/lib/anime.es.js';
import '../styles/components/Metronome.scss';

const Metronome = () => {

    const timeSignature = 4;
    const bpm = 92;
    const beatDuration = 60 * 1000 / bpm;
    const subBeatDuration = beatDuration / 100;
    const barDuration = beatDuration * timeSignature;
    const subBarDuration = barDuration / timeSignature;

    const beatAnimation = (target) => {
        return {
            targets: target,
            opacity: [
                { value: 1, duration: subBeatDuration },
                { value: .25, duration: beatDuration - subBeatDuration },
            ]
        }
    }

    const barAnimation = (target) => {
        return {
            targets: target,
            opacity: [
                { value: 1, duration: subBarDuration},
                { value: 1, duration: barDuration - 2 * subBarDuration },
                { value: .25, duration: subBarDuration },
            ]
        }
    }

    useEffect(() => {

        anime.timeline({
            easing: 'easeOutExpo',
            loop: true
        })
        .add(beatAnimation('#beat-1'))
        .add(beatAnimation('#beat-2'))
        .add(beatAnimation('#beat-3'))
        .add(beatAnimation('#beat-4'));

        anime.timeline({
        easing: 'easeOutExpo',
        loop: true
        })
        .add(barAnimation('#bar-1'))
        .add(barAnimation('#bar-2'))
        .add(barAnimation('#bar-3'))
        .add(barAnimation('#bar-4'));

    }, []);

    return (
        <div id = 'metronome'>
            <div id = 'beats'>
                <div id = 'beat-1' className = 'beat'/>
                <div id = 'beat-2' className = 'beat'/>
                <div id = 'beat-3' className = 'beat'/>
                <div id = 'beat-4' className = 'beat'/>
            </div>
            <div id = 'bars'>
                <div id = 'bar-1' className = 'bar'/>
                <div id = 'bar-2' className = 'bar'/>
                <div id = 'bar-3' className = 'bar'/>
                <div id = 'bar-4' className = 'bar'/>
            </div>
        </div>
    );

}

export default Metronome;