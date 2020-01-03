/* eslint-disable */

// libs
import React, { useState, useEffect, useContext } from 'react';

// components
import ToggleButton from './ToggleButton';
import Oscilloscope from './Oscilloscope';

// contexts
import ThemeContext from '../contexts/ThemeContext';
import LayoutContext from '../contexts/LayoutContext';

// other
import Analyser from '../viz/Analyser';
import { loadArrayBuffer } from '../utils/audioUtils';

// styles
import '../styles/components/ToggleButtonGroup.scss';
import '../styles/components/Oscilloscope.scss';

const ToggleButtonGroup = (props) => {

    const { spectrumFunction, groupMuteButton, groupSoloButton } = useContext(ThemeContext);

    const [solo, setSolo] = useState(false);
    const [mute, setMute] = useState(false);
    const [groupNode, setGroupNode] = useState(props.audioCtx.createGain());
    const [groupAnalyser, setGroupAnalyser] = useState(null);
    const [currentPoly, setCurrentPoly] = useState(0);
    const [playerOrder, setPlayerOrder] = useState([]);
    const [playerOverrides, setPlayerOverrides] = useState([]);

    useEffect(() => {

        // create a filter to taper the low end analyser output
        const filter = props.audioCtx.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 120;
        filter.gain.value = -12;
        groupNode.connect(filter);

        const analyser = new Analyser(props.audioCtx, filter, {
            power: 5,
            minDecibels: -120,
            maxDecibels: 0,
            smoothingTimeConstant: 0
        });

        setGroupAnalyser(analyser);

        // init effects chain entry
        const effectsChainEntry = props.audioCtx.createGain();
        effectsChainEntry.gain.value = 1;

        // init effects chain exit
        const effectsChainExit = props.audioCtx.createGain();
        effectsChainExit.gain.value = 1;

        // init highpass
        const hpFilter = props.audioCtx.createBiquadFilter()
        hpFilter.type = 'highpass';
        hpFilter.frequency.value = 20;
        hpFilter.Q.value = 0.71;
        props.handleAddEffect(hpFilter, 'highpass');

        // init lowpass
        const lpFilter = props.audioCtx.createBiquadFilter()
        lpFilter.type = 'lowpass';
        lpFilter.frequency.value = 20000;
        lpFilter.Q.value = 0.71;
        props.handleAddEffect(lpFilter, 'lowpass');

        // init reverb
        const reverbDryNode = props.audioCtx.createGain();
        reverbDryNode.gain.value = 1;
        props.handleAddEffect(reverbDryNode, 'reverb-dry');

        const reverbWetNode = props.audioCtx.createGain();
        reverbWetNode.gain.value = 0;
        props.handleAddEffect(reverbWetNode, 'reverb-wet');

        const reverbNode = props.audioCtx.createConvolver();

        // load impulse response to be used in convolution reverb
        const pathToAudio = require('../audio/application/impulse-response.wav');

        loadArrayBuffer(pathToAudio).then((arrayBuffer) => {
            props.audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
                reverbNode.buffer = audioBuffer;
            })
        });

        // link effects chain
        groupNode.connect(effectsChainEntry);
        effectsChainEntry.connect(lpFilter);
        lpFilter.connect(hpFilter);
        hpFilter.connect(reverbDryNode);
        hpFilter.connect(reverbWetNode);
        reverbDryNode.connect(effectsChainExit);
        reverbWetNode.connect(reverbNode);
        reverbNode.connect(effectsChainExit);
        effectsChainExit.connect(props.premaster);

    }, [])

    useEffect(() => {

        // solo overrides mute, so only mute when it's exclusive state
        if (mute && !solo) {
            groupNode.gain.value = 0;

            // when mute is turned off, add volume if group is not also overridden
        } else if (!mute && !props.soloOverride) {
            groupNode.gain.value = 1;
        }

    }, [mute])

    useEffect(() => {

        // if this group has been overriden by another solo ...
        if (props.soloOverride && props.soloOverride !== props.name) {
            setSolo(false);
            groupNode.gain.value = 0;
        }

        // if override has been undone
        if (!props.soloOverride && !mute) {
            groupNode.gain.value = 1;
        }


    }, [props.soloOverride])

    useEffect(() => {

        // if solo is turned on ...
        if (solo) {
            // add override
            props.handleAddSolo(props.name);

            // turn volume on
            groupNode.gain.value = 1;
        }

        // if this group was overriding others, but the solo is turned off ...
        if (props.soloOverride === props.name && !solo) {
            // turn off override
            props.handleAddSolo(false);

            // if this group was also on mute, return the volume to that state
            if (mute) {
                groupNode.gain.value = 0;
            }
        }

    }, [solo])

    const handleResetPoly = () => setCurrentPoly(0);

    const handleUpdatePoly = (n, playerId) => {

        setCurrentPoly(currentPoly + n);

        if (n === 1 && (currentPoly < props.polyphony || props.polyphony === -1)) {
            setPlayerOrder(playerOrder.concat([playerId]));
        }

        else if (n === 1 && currentPoly === props.polyphony) {
            setPlayerOverrides(playerOverrides.concat(playerOrder[0]));
            setPlayerOrder(playerOrder.slice(1).concat([playerId]));
        }

        else if (n === -1) {
            setPlayerOrder(playerOrder.filter(p => p !== playerId));
        }

    }

    const handleUpdateOverrides = (playerId) => {

        setPlayerOverrides(playerOverrides.filter(p => p !== playerId));

    }

    return (
        <div className='toggle-button-group flex-col'>

            <div className='flex-row'>

                <h3>{props.name} ({currentPoly} / {
                    props.polyphony === -1 ? props.voices.length : props.polyphony
                })</h3>

                {groupAnalyser && groupNode &&
                    <Oscilloscope
                        index={props.index}
                        spectrumFunction={spectrumFunction}
                        groupCount={props.groupCount}
                        gradient={true}
                        name={props.name}
                        analyser={groupAnalyser}
                    />
                }

                <button
                    className='solo-button'
                    style={solo ? {
                        background: groupSoloButton
                    } : undefined}
                    onClick={() => setSolo(!solo)}
                >S</button>
                <button
                    className='mute-button'
                    style={mute ? {
                        background: groupMuteButton
                    } : undefined}
                    onClick={() => setMute(!mute)}
                >M</button>

            </div>


            <div className='toggle-buttons flex-row'>

                {props.voices.map((voice) => (
                    <LayoutContext.Consumer>
                        {layoutContext => (
                            <ToggleButton
                                devMode={props.devMode}
                                vh={layoutContext.vh}
                                vw={layoutContext.vw}
                                key={voice.name}
                                name={voice.name}
                                groupName={props.name}
                                length={voice.length}
                                quantizeLength={voice.quantizeLength}
                                handleUpdatePoly={handleUpdatePoly}
                                handleResetPoly={handleResetPoly}
                                handleUpdateOverrides={handleUpdateOverrides}
                                handleAddPlayerReference={props.handleAddPlayerReference}
                                override={playerOverrides.indexOf(voice.name) !== -1}
                                groupNode={groupNode}
                                audioCtx={props.audioCtx}
                                audioCtxInitTime={props.audioCtxInitTime}
                                effectsChainEntry={props.effectsChainEntry}
                                effectsChainExit={props.effectsChainExit}
                            />
                        )}
                    </LayoutContext.Consumer>
                ))}

            </div>

        </div>
    );
}

export default ToggleButtonGroup;