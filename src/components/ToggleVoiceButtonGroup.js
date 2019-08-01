import React from 'react';
import ToggleVoiceButton from './ToggleVoiceButton';

const ToggleVoiceButtonGroup = (props) => {
    return (
        <div>
            {props.voices.map((voice) => {
                return (
                    <ToggleVoiceButton
                        key = {voice.name}
                        id = {voice.name}
                        fileName = {voice.fileName}
                        length = {voice.length}
                        quantizeLength = {voice.quantizeLength}
                    />
                )
            })}
        </div>
    )
};

export default ToggleVoiceButtonGroup;