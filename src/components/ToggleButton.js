import React from 'react';
import '../styles/components/ToggleButton.scss';

const ToggleButton = (props) => {

        return (
            <button className = 'toggle-button'>
                {props.config.name}
            </button>
        );
}

export default ToggleButton;