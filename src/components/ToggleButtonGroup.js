// libs
import React from 'react';

// components
import { ToggleButton } from './ToggleButton';
import { Oscilloscope } from './Oscilloscope';

// contexts
import { ThemeContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';

// other
import { Analyser } from '../classes/Analyser';
import { loadArrayBuffer } from '../utils/audioUtils';

// styles
import '../styles/components/ToggleButtonGroup.scss';
import '../styles/components/Oscilloscope.scss';

export const ToggleButtonGroup = (props) => {

    const { groupMuteButton, groupSoloButton } = React.useContext(ThemeContext);
    const { dispatch, audioCtx, premaster } = React.useContext(MusicPlayerContext);

    // point that connects voices to group
    const groupNodeRef = React.useRef(audioCtx.createGain());

    const [oAnalyser, setOAnalyser] = React.useState(null);
    const [solo, setSolo] = React.useState(false);
    const [mute, setMute] = React.useState(false);
    const [playerOrder, setPlayerOrder] = React.useState([]);
    const [playerOverrides, setPlayerOverrides] = React.useState([]);

    React.useEffect(() => {

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

        const lpFilter = audioCtx.createBiquadFilter()
        lpFilter.type = 'lowpass';
        lpFilter.frequency.value = 20000;
        lpFilter.Q.value = 0.71;

        const reverbDryNode = audioCtx.createGain();
        reverbDryNode.gain.value = 1;

        const reverbWetNode = audioCtx.createGain();
        reverbWetNode.gain.value = 0;

        const reverbNode = audioCtx.createConvolver();

        // load impulse response to be used in convolution reverb
        const pathToAudio = require('../audio/application/impulse-response.wav');

        loadArrayBuffer(pathToAudio).then((arrayBuffer) => {
            audioCtx.decodeAudioData(arrayBuffer, (audioBuffer) => {
                reverbNode.buffer = audioBuffer;
            })
        });

        // link effects chain
        groupNodeRef.current.connect(effectsChainEntry);
        effectsChainEntry.connect(lpFilter);
        lpFilter.connect(hpFilter);
        hpFilter.connect(reverbDryNode);
        hpFilter.connect(reverbWetNode);
        reverbDryNode.connect(effectsChainExit);
        reverbWetNode.connect(reverbNode);
        reverbNode.connect(effectsChainExit);
        effectsChainExit.connect(premaster);

        // analyser for the oscilloscope
        const oAnalyser = new Analyser(audioCtx, filter, {
            id: `${props.name}-oscilloscope-analyser`,
            power: 5,
            minDecibels: -120,
            maxDecibels: 0,
            smoothingTimeConstant: 0
        });

        // analyser for the group
        const gAnalyser = new Analyser(audioCtx, effectsChainExit, {
            id: `${props.name}-analyser`,
            ...props.analyserParams
        });

        setOAnalyser(oAnalyser);

        dispatch({
            type: 'addAnalyser', payload: { analyser: gAnalyser }
        });

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'reverb-dry',
                effect: reverbDryNode
            }
        });

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'reverb-dry',
                effect: reverbDryNode
            }
        });

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'lowpass',
                effect: lpFilter
            }
        });

        dispatch({
            type: 'addEffect',
            payload: {
                effectType: 'highpass',
                effect: hpFilter
            }
        });

    }, []);

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

    }, [mute, solo]);

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


    }, [props.soloOverride]);

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

                {oAnalyser && <Oscilloscope
                    index={props.index}
                    groupCount={props.groupCount}
                    gradient={true}
                    name={props.name}
                    analyser={oAnalyser}
                />}

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