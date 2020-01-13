// libs
import React, { useState, useEffect, useContext } from 'react';

// components
import { ToggleButton } from './ToggleButton';
import { Oscilloscope } from './Oscilloscope';

// contexts
import { TestingContext } from '../contexts/contexts';
import { ThemeContext } from '../contexts/contexts';
import { LayoutContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';

// other
import { Analyser } from '../viz/Analyser';
import { loadArrayBuffer } from '../utils/audioUtils';

// styles
import '../styles/components/ToggleButtonGroup.scss';
import '../styles/components/Oscilloscope.scss';

export const ToggleButtonGroup = (props) => {

    const { spectrumFunction, groupMuteButton, groupSoloButton } = useContext(ThemeContext);
    const { dispatch, audioCtx, audioCtxInitTime, premaster } = useContext(MusicPlayerContext);

    // analyser for this group
    const groupAnalyserRef = React.useRef(new Analyser(audioCtx, filter, {
        power: 5,
        minDecibels: -120,
        maxDecibels: 0,
        smoothingTimeConstant: 0
    }));

    // point that connects voices to group
    const groupNodeRef = React.useRef(audioCtx.createGain());

    const [solo, setSolo] = useState(false);
    const [mute, setMute] = useState(false);
    const [groupNode, setGroupNode] = useState(audioCtx.createGain());
    const [groupAnalyser, setGroupAnalyser] = useState(null);
    const [currentPoly, setCurrentPoly] = useState(0);
    const [playerOrder, setPlayerOrder] = useState([]);
    const [playerOverrides, setPlayerOverrides] = useState([]);

    useEffect(() => {

        // create a filter to taper the low end analyser output
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowshelf';
        filter.frequency.value = 120;
        filter.gain.value = -12;
        groupNodeRef.current.connect(filter);

        const effectsChainEntry = audioCtx.createGain();
        effectsChainEntry.gain.value = 1;

        const effectsChainExit = audioCtx.createGain();
        effectsChainExit.gain.value = 1;

        const hpFilter = audioCtx.createBiquadFilter()
        hpFilter.type = 'highpass';
        hpFilter.frequency.value = 20;
        hpFilter.Q.value = 0.71;

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'highpass',
                effect: hpFilter
            }
        });

        const lpFilter = audioCtx.createBiquadFilter()
        lpFilter.type = 'lowpass';
        lpFilter.frequency.value = 20000;
        lpFilter.Q.value = 0.71;

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'lowpass',
                effect: lpFilter
            }
        });

        const reverbDryNode = audioCtx.createGain();
        reverbDryNode.gain.value = 1;

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'reverb-dry',
                effect: reverbDryNode
            }
        });

        const reverbWetNode = audioCtx.createGain();
        reverbWetNode.gain.value = 0;

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'reverb-dry',
                effect: reverbDryNode
            }
        });

        const reverbNode = audioCtx.createConvolver();

        // load impulse response to be used in convolution reverb
        const pathToAudio = require('../audio/application/impulse-response.wav');

        loadArrayBuffer(pathToAudio).then((arrayBuffer) => {
            audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
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
        effectsChainExit.connect(premaster);

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

                <Oscilloscope
                    index={props.index}
                    groupCount={props.groupCount}
                    gradient={true}
                    name={props.name}
                    analyser={groupAnalyserRef.current}
                />

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
                    <ToggleButton
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
                        effectsChainEntry={props.effectsChainEntry}
                        effectsChainExit={props.effectsChainExit}
                    />
                ))}

            </div>

        </div>
    );
}