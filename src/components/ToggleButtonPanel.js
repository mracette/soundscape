/* eslint-disable */

// libs
import React, { useContext, useState } from 'react';

// components
import ToggleButtonGroup from './ToggleButtonGroup';

// contexts
import LayoutContext from '../contexts/ThemeContext';
import ThemeContext from '../contexts/ThemeContext';
import MusicPlayerContext from '../contexts/MusicPlayerContext';

// styles
import '../styles/components/ToggleButtonPanel.scss';

const ToggleButtonPanel = (props) => {

    const { vw, vh } = useContext(LayoutContext);
    const {
        panelMuteButtonBackground,
        panelRandomizeButtonBackground,
        panelResetButtonBackground } = useContext(ThemeContext);
    const { groups } = useContext(MusicPlayerContext);

    const [soloOverride, setSoloOverride] = useState(false);

    const handleAddSolo = (value) => {
        setSoloOverride(value);
    };

    return (

        <div id='toggle-button-panel' className='flex-col'>

            <div
                className='flex-col'
                style={{
                    flex: '1 1 auto'
                }}
            >

                <h2>Voices</h2>

                <div className='flex-row'>

                    <button
                        className='button-white'
                        id='toggle-button-panel-reset'
                        onClick={props.handleReset}
                    >
                        Reset
                        </button>

                    <button
                        id='toggle-button-panel-randomize'
                        className={'button-white'}
                        style={props.randomize ? {
                            background: panelRandomizeButtonBackground
                        } : undefined}
                        onClick={props.handleRandomize}
                    >
                        Randomize
                        </button>

                    <button
                        id='toggle-button-panel-mute'
                        className={'button-white'}
                        style={props.mute ? {
                            background: panelMuteButtonBackground
                        } : undefined}
                        onClick={props.handleMute}
                    >
                        Mute
                        </button>

                </div>

            </div>

            {groups.map((group, index) => (
                <ToggleButtonGroup
                    index={index}
                    handleAddSolo={handleAddSolo}
                    soloOverride={soloOverride}
                    key={group.name}
                    name={group.name}
                    groupCount={groups.length}
                    polyphony={group.polyphony}
                    voices={group.voices}
                    handleAddPlayerReference={props.handleAddPlayerReference}
                    handleAddEffect={props.handleAddEffect}
                    audioCtx={props.audioCtx}
                    audioCtxInitTime={props.audioCtxInitTime}
                    premaster={props.premaster}
                    effectsChainEntry={props.effectsChainEntry}
                    effectsChainExit={props.effectsChainExit}
                />
            ))}

        </div>
    );
}

export default ToggleButtonPanel;