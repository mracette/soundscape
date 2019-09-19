// libs
import React from 'react';
import Tone from 'tone';

// components
import CanvasViz from './CanvasViz';
import EffectsPanel from './EffectsPanel';
import FreqBands from './FreqBands';
import MenuButtonParent from './MenuButtonParent';
import Metronome from './Metronome';
import Oscilloscope from './Oscilloscope';
import SongInfoPanel from './SongInfoPanel';
import ToggleButtonPanel from './ToggleButtonPanel';

// contexts
import { ApplicationAudioContext } from '../contexts/ApplicationAudioContext';

// other
import Analyser from '../viz/Analyser';

// styles
import '../styles/components/MusicPlayer.scss';

function MusicPlayer(props) {

    // init transport
    Tone.Transport.bpm.value = props.songConfig.bpm;
    Tone.Transport.timeSignature = props.songConfig.timeSignature;
    Tone.Transport.start();

    // init context
    Tone.context.latencyHint = 60 / (props.songConfig.bpm * 8) 
    Tone.context.lookAhead = 0;
    Tone.context.resume();

    // init premaster
    const premaster = new Tone.Gain().toMaster();

    // init premaster analyser
    const premasterAnalyser = new Analyser(Tone.context, premaster, {
        power: 6,
        minDecibels: -120,
        maxDecibels: 0,
        smoothingTimeConstanct: 0.85
    });

    //Tone.connect(premasterAnalyser.output, Tone.context.destination);

    // if song has an ambient track, load it
    if(props.songConfig.ambientTrack) {
        // const ambientTrack = require(`../audio/${props.songConfig.id}/melody-trance[4].mp3`)
        // const ambientTrack = require(`../audio/${props.songConfig.id}/ambient-track.mp3`)
        // const ambientPlayer = new Tone.Player(ambientTrack);
        // ambientPlayer.connect(premaster);
        // ambientPlayer.loop = true;
        // ambientPlayer.autostart = true;
    }

    // initialize music player state, which is shared with child components through the context API
    const musicPlayerState = {
        tone: Tone,
        transport: Tone.Transport,
        context: Tone.context,
        premaster
    }

    return (
        <div>
            <h3 id = 'song-title'>Now Playing: {props.songConfig.name}</h3>
            
            <ApplicationAudioContext.Provider value={musicPlayerState}>

                <Metronome />

                <Oscilloscope 
                    analyser = {premasterAnalyser}
                />

                <FreqBands 
                    analyser = {premasterAnalyser}
                />

                <MenuButtonParent 
                    name = 'Menu'
                    direction = 'right'
                    separation = '6rem'
                    parentSize = '5rem'
                    childSize = '3rem'
                    clickToOpen = { true }
                    childButtonProps = { [{
                        id: 'toggles',
                        icon: '',
                        content: <ToggleButtonPanel config = {props.songConfig}/>
                    }, {
                        id: 'effects',
                        icon: '',
                        content: <EffectsPanel/>
                    }, {
                        id: 'song-info',
                        icon: '',
                        content: <SongInfoPanel config = {props.songConfig}/>
                    }] }
                />

                <CanvasViz 
                    config = {props.songConfig}
                />

            </ApplicationAudioContext.Provider>

        </div>
    )
}

export default MusicPlayer;