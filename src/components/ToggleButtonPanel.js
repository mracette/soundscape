import React from 'react';
import ToggleButtonGroup from './ToggleButtonGroup';
import '../styles/components/ToggleButtonPanel.scss';

const ToggleButtonPanel = (props) => {

    const buttonGroupsConfig = props.config.groups;

        return (

            <div id = 'toggle-button-panel'>

                <h2>Voices</h2>

                <div>
                    <button id = 'toggle-button-panel-reset'>
                        Reset
                    </button>

                    <button id = 'toggle-button-panel-randomize'>
                        Randomize
                    </button>

                    <button id = 'toggle-button-panel-mute'>
                        Mute
                    </button>
                </div>

                {buttonGroupsConfig.map((group) => (
                    <ToggleButtonGroup 
                        key = {group.name}
                        config = {group}
                    />
                ))}

            </div>
        );
}

export default ToggleButtonPanel;