import React from 'react';
import ToggleButtonGroup from './ToggleButtonGroup';
import '../styles/components/ToggleButtonPanel.scss';

const ToggleButtonPanel = (props) => {

    const buttonGroupsConfig = props.config.groups;

        return (

            <div id = 'toggle-button-panel'>

                {buttonGroupsConfig.map((group) => (
                    <ToggleButtonGroup 
                        config = {group}
                    />
                ))}

            </div>
        );
}

export default ToggleButtonPanel;