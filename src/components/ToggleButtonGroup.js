import React from 'react';
import ToggleButton from './ToggleButton';
import '../styles/components/ToggleButtonGroup.scss';

const ToggleButtonGroup = (props) => {

        return (
            <div className = 'toggle-button-group'>

                <h3>{props.config.name}</h3>

                <div className = 'toggle-buttons'>

                    {props.config.voices.map((voice) => (
                        <ToggleButton
                            key = {voice.name}
                            config = {voice}
                        />
                    ))}

                </div>

            </div>
        );
}

export default ToggleButtonGroup;