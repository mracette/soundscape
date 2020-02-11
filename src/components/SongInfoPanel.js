// libs
import React from 'react';

// components
import { SocialIcons } from './iconography/SocialIcons';

// context
import { SongContext } from '../contexts/contexts';
import { InfoContext } from '../contexts/contexts';

// styles
import '../styles/components/SongInfoPanel.scss';

export const SongInfoPanel = (props) => {

    const { name } = React.useContext(SongContext)
    const { credits } = React.useContext(InfoContext);

    return (
        <div id='song-info-panel'>
            <h2>{name}</h2>
            {credits.map((c) => {
                return <p>{c.type}{c.content}</p>
            })}
            <h2>Connect</h2>
            <SocialIcons />
            <p>PS: We're looking for 3D artists to collaborate with. If you're interested or know someone who might be, please get in touch!</p>
        </div>
    )

}