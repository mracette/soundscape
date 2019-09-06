import React from 'react';
import MenuButtonParent from './MenuButtonParent';
import ToggleButtonPanel from './ToggleButtonPanel';

function MusicPlayer(props) {
    return (
        <div>
            <h3>Now Playing: {props.songConfig.name}</h3>
            
            <MenuButtonParent 
                name = 'Menu'
                direction = 'right'
                childrenProps = { [{
                    id: 'toggles',
                    icon: ''
                }, {
                    id: 'controls',
                    icon: ''
                }, {
                    id: 'about',
                    icon: ''
                }] }
                separation = '6rem'
                parentSize = '5rem'
                childSize = '3rem'
                clickToOpen = { true }
            >

                {/* these children are sent down the chain into the menu and can be accessed using props.children */}
                {/* they correspond to the MenuButtonParent childrenProps object, and must match its order */}
                <ToggleButtonPanel config = {props.songConfig}/>
                <ToggleButtonPanel config = {props.songConfig}/>
                <ToggleButtonPanel config = {props.songConfig}/>
            
            </ MenuButtonParent>

            {/* canvas viz */}
        </div>
    )
}

export default MusicPlayer;