import React from 'react';

const ToggleVoiceButton = (props) => {
    return (
        <button
            onClick = {() => {
                console.log(props.player);
            }}
        >{props.id}</button>
    )
};

export default ToggleVoiceButton;