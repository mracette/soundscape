import React from 'react';
import ToggleButton from './ToggleButton';

const ToggleButtonGroup = (props) => {
    // console.log(props);
    return (
        <div className={'button-group'}>
            {props.voices.map((voice) => {
                return (
                    <ToggleButton
                        key = {voice.name}
                        id = {voice.name}
                        songName = {props.songName}
                        fileName = {voice.fileName}
                        length = {voice.length}
                        quantizeLength = {voice.quantizeLength}
                        transport = {props.transport}
                        handleAddPlayer = {props.handleAddPlayer}
                    />
                )
            })}
        </div>
    )
};

export default ToggleButtonGroup;