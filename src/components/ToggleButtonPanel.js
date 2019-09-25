import React, { useState } from 'react';
import ToggleButtonGroup from './ToggleButtonGroup';
import '../styles/components/ToggleButtonPanel.scss';

const ToggleButtonPanel = (props) => {

    const buttonGroupsConfig = props.config.groups;

        return (

            <div id = 'toggle-button-panel'>

                <h2>Voices</h2>

                <div>
                    <button 
                        id = 'toggle-button-panel-reset'
                        onClick = {props.handleReset}
                    >
                        Reset
                    </button>

                    <button 
                        id = 'toggle-button-panel-randomize'
                        onClick = {props.handleRandomize}
                    >
                        Randomize
                    </button>

                    <button id = 'toggle-button-panel-mute'>
                        Mute
                    </button>
                </div>

                {buttonGroupsConfig.map((group) => (
                    <ToggleButtonGroup 
                        devMode = {props.devMode}
                        key = {group.name}
                        name = {group.name}
                        polyphony = {group.polyphony}
                        voices = {group.voices}
                        handleAddPlayerReference = {props.handleAddPlayerReference}
                        audioCtx = {props.audioCtx}
                        audioCtxInitTime = {props.audioCtxInitTime}
                        premaster = {props.premaster}
                    />
                ))}

            </div>
        );
}

export default ToggleButtonPanel;