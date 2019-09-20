import React from 'react';
import ToggleButton from './ToggleButton';
import '../styles/components/ToggleButtonGroup.scss';

const ToggleButtonGroup = (props) => {

        return (
            <div className = 'toggle-button-group'>

                <h3>{props.name}</h3>

                <div className = 'toggle-buttons'>

                    {props.voices.map((voice) => (
                        <ToggleButton
                            key = {voice.name}
                            name = {voice.name}
                            length = {voice.length}
                            quantizeLength = {voice.quantizeLength}
                        />
                    ))}

                </div>

            </div>
        );
}

export default ToggleButtonGroup;