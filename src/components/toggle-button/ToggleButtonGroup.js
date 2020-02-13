// libs
import React from 'react';

// components
import { ToggleButton } from './ToggleButton';
import { Oscilloscope } from '../Oscilloscope';

// contexts
import { ThemeContext } from '../../contexts/contexts';
import { MusicPlayerContext } from '../../contexts/contexts';
import { ApplicationContext } from '../../contexts/contexts';

// other
import { Analyser } from '../../classes/Analyser';
import { loadArrayBuffer } from 'crco-utils';
import { initGain, initHighpass, initLowpass, effectParams } from '../../utils/audioUtils';

// styles
import '../../styles/components/ToggleButtonGroup.scss';
import '../../styles/components/Oscilloscope.scss';

export const ToggleButtonGroup = (props) => {

    const { groupMuteButton, groupSoloButton } = React.useContext(ThemeContext);
    const { dispatch, lowpass, highpass, ambience } = React.useContext(MusicPlayerContext);
    const { audioCtx, premaster } = React.useContext(ApplicationContext);

    // initialize audio effects
    const groupNodeRef = React.useRef(initGain(audioCtx, 1));
    const effectsChainEntryRef = React.useRef(initGain(audioCtx, 1));
    const effectsChainExitRef = React.useRef(initGain(audioCtx, 1));
    const hpFilterRef = React.useRef(initHighpass(audioCtx));
    const lpFilterRef = React.useRef(initLowpass(audioCtx));
    const reverbDryRef = React.useRef(initGain(audioCtx, 1));
    const reverbWetRef = React.useRef(initGain(audioCtx, 0));
    const reverbRef = React.useRef(audioCtx.createConvolver());

    const [solo, setSolo] = React.useState(false);
    const [mute, setMute] = React.useState(false);
    const [playerOrder, setPlayerOrder] = React.useState([]);
    const [playerOverrides, setPlayerOverrides] = React.useState([]);

    /* Audio effects setup */
    React.useEffect(() => {

        // load impulse response to be used in convolution reverb
        const pathToAudio = require('../../audio/application/impulse-response.wav');

        loadArrayBuffer(pathToAudio).then((arrayBuffer) => {
            audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
                reverbRef.current.buffer = audioBuffer;
                dispatch({
                    type: 'impulseResponse',
                    payload: {
                        name: 'standard',
                        buffer: audioBuffer
                    }
                })
            })
        });

        // link effects chain
        groupNodeRef.current.connect(effectsChainEntryRef.current);
        effectsChainEntryRef.current.connect(lpFilterRef.current);
        lpFilterRef.current.connect(hpFilterRef.current);
        hpFilterRef.current.connect(reverbDryRef.current);
        hpFilterRef.current.connect(reverbWetRef.current);
        reverbDryRef.current.connect(effectsChainExitRef.current);
        reverbWetRef.current.connect(reverbRef.current);
        reverbRef.current.connect(effectsChainExitRef.current);
        effectsChainExitRef.current.connect(premaster);

        const groupAnalyser = new Analyser(audioCtx, effectsChainExitRef.current, {
            id: `${props.name}-analyser`,
            ...props.analyserParams
        });

        dispatch({
            type: 'addAnalyser', payload: {
                analyser: groupAnalyser
            }
        });

    }, [audioCtx, dispatch, props.analyserParams, props.name, premaster])

    /* Effects Hooks */
    React.useEffect(() => {

        const freqParams = effectParams.hpFilter.expFreqParams;
        const QParams = effectParams.hpFilter.expQParams;
        hpFilterRef.current.frequency.value = freqParams.a * Math.pow(freqParams.b, highpass);
        hpFilterRef.current.Q.value = QParams.a * Math.pow(QParams.b, highpass);

    }, [highpass]);

    React.useEffect(() => {

        const freqParams = effectParams.lpFilter.expFreqParams;
        const QParams = effectParams.lpFilter.expQParams;
        lpFilterRef.current.frequency.value = freqParams.a * Math.pow(freqParams.b, lowpass);
        lpFilterRef.current.Q.value = QParams.a * Math.pow(QParams.b, lowpass);

    }, [lowpass]);

    React.useEffect(() => {

        const wet = effectParams.ambience.minWet +
            (effectParams.ambience.maxWet - effectParams.ambience.minWet) *
            (ambience - 1) / 99;

        reverbDryRef.current.gain.value = 1 - wet;
        reverbWetRef.current.gain.value = wet;

    }, [ambience]);

    React.useEffect(() => {

        // solo overrides mute, so only mute when it's exclusive state
        if (mute && !solo) {
            groupNodeRef.current.gain.value = 0;

            // when mute is turned off, add volume if group is not also overridden by another group's solo
        } else if (!mute && !props.soloOverride) {
            groupNodeRef.current.gain.value = 1;
        }

        // if solo is turned on ...
        if (solo) {
            // add override and turn volume on
            props.handleAddSolo(props.name);
            groupNodeRef.current.gain.value = 1;
        }

        if (props.soloOverride === props.name && !solo) {
            // turn off override
            props.handleAddSolo(false);
            // if this group was also on mute, return the volume to that state
            if (mute) {
                groupNodeRef.current.gain.value = 0;
            }
        }

    }, [mute, solo, props]);

    React.useEffect(() => {

        // if this group has been overriden by another solo ...
        if (props.soloOverride && props.soloOverride !== props.name) {
            setSolo(false);
            groupNodeRef.current.gain.value = 0;
        }

        // if override has been undone
        if (!props.soloOverride && !mute) {
            groupNodeRef.current.gain.value = 1;
        }


    }, [props.soloOverride, mute, props.name]);

    const handleUpdatePlayerOrder = React.useCallback((playerId, newState) => {

        if (newState === 'pending-start') {

            if (props.currentPolyphony < props.polyphony || props.polyphony === -1) {

                // add this player to the end of the playerOrder list
                setPlayerOrder(playerOrder.concat([playerId]));

            } else {

                // override the latest player to be added to the list, then append the new one
                setPlayerOverrides(playerOverrides.concat(playerOrder[0]));
                setPlayerOrder(playerOrder.slice(1).concat([playerId]));

            }

        } else if (newState === 'pending-stop') {

            // remove the player from the playerOrder list
            setPlayerOrder(playerOrder.filter(p => p !== playerId));

        }

    }, [props.currentPolyphony, props.polyphony, playerOrder, playerOverrides]);

    const handleUpdateOverrides = React.useCallback((playerId) => {

        setPlayerOverrides(playerOverrides.filter(p => p !== playerId));

    }, [playerOverrides]);

    return (
        <div className='toggle-button-group flex-col'>

            <div className='flex-row'>

                <h3>{props.name} ({props.currentPolyphony} / {
                    props.polyphony === -1 ? props.voices.length : props.polyphony
                })</h3>

                <Oscilloscope
                    input={effectsChainExitRef.current}
                    index={props.index}
                    groupCount={props.groupCount}
                    gradient={true}
                    name={props.name}
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
                        handleUpdatePlayerOrder={handleUpdatePlayerOrder}
                        handleUpdateOverrides={handleUpdateOverrides}
                        override={playerOverrides.indexOf(voice.name) !== -1}
                        groupNode={groupNodeRef.current}
                    />
                ))}

            </div>

        </div>
    );
}