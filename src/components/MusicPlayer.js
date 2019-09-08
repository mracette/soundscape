import React from 'react';
import MenuButtonParent from './MenuButtonParent';
import Metronome from './Metronome';
import ToggleButtonPanel from './ToggleButtonPanel';
import '../styles/components/MusicPlayer.scss';

function MusicPlayer(props) {

    return (
        <div>
            <h3 id = 'song-title'>Now Playing: {props.songConfig.name}</h3>
            
            <Metronome />

            <MenuButtonParent 
                name = 'Menu'
                direction = 'right'
                separation = '6rem'
                parentSize = '5rem'
                childSize = '3rem'
                clickToOpen = { true }
                childButtonProps = { [{
                    id: 'toggles',
                    icon: '',
                    content: <ToggleButtonPanel config = {props.songConfig}/>
                }, {
                    id: 'controls',
                    icon: '',
                    content: <ToggleButtonPanel config = {props.songConfig}/>
                }, {
                    id: 'about',
                    icon: '',
                    content: <ToggleButtonPanel config = {props.songConfig}/>
                }] }
            />
            
            {/* canvas viz */}
        </div>
    )
}

export default MusicPlayer;