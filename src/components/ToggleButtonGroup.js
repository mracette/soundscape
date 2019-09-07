import React from 'react';
import ToggleButton from './ToggleButton';
import '../styles/components/ToggleButtonGroup.scss';

const ToggleButtonGroup = (props) => {

        return (
            <div class = 'toggle-button-group'>

                <h3>{props.config.groupName}</h3>

                <div class = 'toggle-buttons'>

                    {props.config.voices.map((voice) => (
                        <ToggleButton 
                            config = {voice}
                        />
                    ))}

                </div>

            </div>
        );
}

export default ToggleButtonGroup;