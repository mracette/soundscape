// libs
import React from 'react';

// components
import { ToggleButtonGroup } from './ToggleButtonGroup';

// contexts
import { ThemeContext } from '../../contexts/contexts';
import { MusicPlayerContext } from '../../contexts/contexts';
import { SongContext } from '../../contexts/contexts';

// styles
import '../../styles/components/ToggleButtonPanel.scss';

export const ToggleButtonPanel = (props) => {

    console.log('render');

    const {
        panelMuteButton,
        panelRandomizeButton,
    } = React.useContext(ThemeContext);

    const { dispatch, randomize, mute } = React.useContext(MusicPlayerContext);

    const { groups } = React.useContext(SongContext);

    const [soloOverride, setSoloOverride] = React.useState(false);

    const handleAddSolo = React.useCallback((value) => {
        setSoloOverride(value);
    }, []);

    return (

        <div
            id='toggle-button-panel'
            className='flex-panel'
        >

            <h2>Voices</h2>

            <div className='flex-row'>

                <button
                    className='button-white grouped-buttons'
                    id='toggle-button-panel-reset'
                    onClick={props.handleReset}
                >
                    Reset
                    </button>

                <button
                    id='toggle-button-panel-randomize'
                    className='button-white grouped-buttons'
                    style={randomize ? {
                        background: panelRandomizeButton
                    } : undefined}
                    onClick={() => randomize ? dispatch({ type: 'stopRandomize' }) : dispatch({ type: 'startRandomize' })}
                >
                    Background Mode
                    </button>

                <button
                    id='toggle-button-panel-mute'
                    className='button-white grouped-buttons'
                    style={mute ? {
                        background: panelMuteButton
                    } : undefined}
                    onClick={() => mute ? dispatch({ type: 'stopMute' }) : dispatch({ type: 'startMute' })}
                >
                    Mute
                    </button>

            </div>

            {groups.map((group, index) => (
                <ToggleButtonGroup
                    index={index}
                    handleAddSolo={handleAddSolo}
                    soloOverride={soloOverride}
                    key={group.name}
                    name={group.name}
                    groupCount={groups.length}
                    currentPolyphony={props.players.filter((p) => (
                        p.groupName === group.name && (
                            p.playerState === 'active' || p.playerState === 'pending-start'
                        ))).length}
                    polyphony={group.polyphony}
                    voices={group.voices}
                    analyserParams={group.analyser}
                />
            ))}

        </div>
    );
}