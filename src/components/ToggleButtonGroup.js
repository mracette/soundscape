import React from 'react';
import ToggleButton from './ToggleButton';

const ToggleButtonGroup = (props) => {
    // console.log(props);
    return (
        <div className={'button-group'}>
            <div className={'button-group-table'}>
                <div className={'button-group-header'}>
                    {props.groupName}
                </div>
                <div>
                {props.voices.map((voice) => {
                    return (
                        <ToggleButton

                        key = {voice.name}
                        id = {voice.name}
                        fileName = {voice.fileName}
                        length = {voice.length}
                        quantizeLength = {voice.quantizeLength}
                        
                        groupName = {props.groupName}
                        songName = {props.songName}
                        tone = {props.tone}
                        transport = {props.transport}
                        handleAddPlayer = {props.handleAddPlayer}
                        handleChangeState = {props.handleChangeState}
                        musicPlayerState = {props.musicPlayerState}
                        devMode = {props.devMode}
                        
                        />
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

export default ToggleButtonGroup;