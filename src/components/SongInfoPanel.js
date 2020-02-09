// libs
import React from 'react';

// context
import { SongContext } from '../contexts/contexts';
import { InfoContext } from '../contexts/contexts';

// styles
import '../styles/components/SongInfoPanel.scss';

export const SongInfoPanel = (props) => {

    const { name, bpm, keySignature, timeSignature } = React.useContext(SongContext)
    const { credits } = React.useContext(InfoContext);

    return (
        <div id='song-info-panel'>
            <h2>{name}</h2>
            {credits.map((c) => {
                return <p>{c.type}{c.content}</p>
            })}
            <h2>Connect</h2>
            <div className='flex-row'>
                <a className='social-link' href="mailto:markracette@gmail.com">Email</a>&nbsp;|&nbsp;
                <a className='social-link' href='https://instagram.com/rgb.ig'>Instagram</a>&nbsp;|&nbsp;
                <a className='social-link' href='https://twitter.com/markracette'> Twitter</a>&nbsp;|&nbsp;
                <a className='social-link' href='https://github.com/mracette'> Github</a>
            </div>
            <p>PS: We're looking for 3D artists to collaborate with. If you're interested or know someone who might be, please get in touch!</p>
        </div>
    )

}