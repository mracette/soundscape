import React from 'react';
import ToggleVoiceButton from './ToggleVoiceButton';

const ToggleVoiceButtonGroup = (props) => {
    return (
        <div>
            {props.voices.map((voice) => {
                console.log(props);
                return (
                    <ToggleVoiceButton
                        key = {voice.name}
                        id = {voice.name}
                        player = {voice.player}
                    />
                )
            })}
        </div>
    )
};

export default ToggleVoiceButtonGroup;