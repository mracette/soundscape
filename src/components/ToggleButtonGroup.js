import React from 'react';
import ToggleButton from './ToggleButton';
import '../styles/components/ToggleButtonGroup.scss';

const ToggleButtonGroup = (props) => {

        return (
            <div id = 'toggle-button-group'>

                <h3>{props.config.groupName}</h3>

                {props.config.voices.map((voice) => (
                    <ToggleButton 
                        config = {voice}
                    />
                ))}

            </div>
        );
}

export default ToggleButtonGroup;