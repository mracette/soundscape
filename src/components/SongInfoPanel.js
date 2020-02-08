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
            <p>We're looking for 3D artists to partner with. Interested? Know someone who might be? Please get in touch.</p>
            <h2>Song</h2>
            <p>Title: {name}</p>
            <p>BPM: {bpm}</p>
            <p>Key Signature: {keySignature}</p>
            <p>Time Signature: {timeSignature}/4 </p>
            <h2>Credits</h2>
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
        </div>
    )

}