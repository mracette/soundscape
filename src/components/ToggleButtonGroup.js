
// libs
import React, { useState, useEffect } from 'react';

// components
import ToggleButton from './ToggleButton';
import Oscilloscope from './Oscilloscope';
import FreqBands from './FreqBands';

// other
import Analyser from '../viz/Analyser';

// styles
import '../styles/components/ToggleButtonGroup.scss';
import '../styles/components/Oscilloscope.scss';

const ToggleButtonGroup = (props) => {
    
    const [ groupNode, setGroupNode ] = useState(null);
    const [ groupAnalyser, setGroupAnalyser ] = useState(null);
    const [ currentPoly, setCurrentPoly ] = useState(0);
    const [ playerOrder, setPlayerOrder ] = useState([]);
    const [ playerOverrides, setPlayerOverrides ] = useState([]);

    useEffect(() => {

        // init group node
        const groupNode = props.audioCtx.createGain();
        groupNode.connect(props.premaster);
        
        const analyser = new Analyser(props.audioCtx, groupNode, {
            power: 5,
            minDecibels: -120,
            maxDecibels: 0,
            smoothingTimeConstant: 0
        });

        setGroupAnalyser(analyser);
        setGroupNode(groupNode);
        
    }, [])


    const handleResetPoly = () => setCurrentPoly(0);

    const handleUpdatePoly = (n, playerId) => {

        setCurrentPoly(currentPoly + n);

        if (n === 1 && (currentPoly < props.polyphony || props.polyphony === -1)) {
            setPlayerOrder(playerOrder.concat([playerId]));
        }

        else if (n === 1 && currentPoly === props.polyphony) {
            setPlayerOverrides(playerOverrides.concat(playerOrder[0]));
            setPlayerOrder(playerOrder.slice(1).concat([playerId]));
        }

        else if (n === -1) {
            setPlayerOrder(playerOrder.filter(p => p !== playerId));
        }

    }

    const handleUpdateOverrides = (playerId) => {

        setPlayerOverrides(playerOverrides.filter(p => p !== playerId));

    }

        return (
            <div className = 'toggle-button-group'>

                <div 
                    style = {{
                        display: 'flex',
                        flexDirection: 'row'
                    }}
                    className = 'flex-row'>

                    <button className = 'solo-button'>S</button>
                    <button className = 'mute-button'>M</button>

                    <h3>{props.name} ({currentPoly} / {
                        props.polyphony === -1 ? props.voices.length : props.polyphony
                    })</h3>

                {groupAnalyser && groupNode && 
                    <Oscilloscope 
                        name = {props.name}
                        analyser = {groupAnalyser} 
                    />
                }

                </div>


                <div className = 'toggle-buttons'>

                    {props.voices.map((voice) => (
                        <ToggleButton
                            devMode = {props.devMode}
                            key = {voice.name}
                            name = {voice.name}
                            groupName = {props.name}
                            length = {voice.length}
                            quantizeLength = {voice.quantizeLength}
                            handleUpdatePoly = {handleUpdatePoly}
                            handleResetPoly = {handleResetPoly}
                            handleUpdateOverrides = {handleUpdateOverrides}
                            handleAddPlayerReference = {props.handleAddPlayerReference}
                            override = {playerOverrides.indexOf(voice.name) !== -1}
                            groupNode = {groupNode}
                            audioCtx = {props.audioCtx}
                            audioCtxInitTime = {props.audioCtxInitTime}
                        />
                    ))}

                </div>

            </div>
        );
}

export default ToggleButtonGroup;