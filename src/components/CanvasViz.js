import React from 'react';
import Analyser from '../viz/Analyser'
import Lake from '../viz/scenes/Lake';

export default class CanvasViz extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            canvas: undefined,
            manager: undefined,
            flagPlayersLoaded: props.flagPlayersLoaded,
            flagCanvasLoaded: false
        }
    }

    componentDidMount() {
        this.setState(() => {
            return {canvas: document.getElementById('canvas-viz')};
        })
    }
    
    componentDidUpdate() {

        // ensures that the following runs only when all the players are loaded
        if(this.props.flagPlayersLoaded && !this.state.flagCanvasLoaded) {

            // TODO: move analyser params to config file           

            // vizConfig is an extension of props.playerGroups that includes analysers and players, which are required by the scene manager
            const vizConfig = {...this.props.playerGroups};

            vizConfig.rhythm.analyser =  new Analyser(this.props.context, this.props.playerGroups.rhythm.effectsChainExit, {
                effectsChain: this.props.effectsChain,
                power: 7,
                smoothingTimeConstant: .5
            });

            vizConfig.atmosphere.analyser = new Analyser(this.props.context, this.props.playerGroups.atmosphere.effectsChainExit, {
                    split: true,
                    effectsChain: this.props.effectsChain,
                    smoothingTimeConstant: 0.2,
                    power: 5,
                    minDecibels: -100,
                    maxDecibels: -30
            });

            vizConfig.melody.analyser = new Analyser(this.props.context, this.props.playerGroups.melody.effectsChainExit, {
                effectsChain: this.props.effectsChain,
                power: 5,
                minDecibels: -40,
                maxDecibels: -5,
                smoothingTimeConstant: 0.5
            });

            vizConfig.harmony.analyser = new Analyser(this.props.context, this.props.playerGroups.harmony.effectsChainExit, {
                effectsChain: this.props.effectsChain,
                power: 9,
                smoothingTimeConstant: 0.95
            });

            vizConfig.bass.analyser = new Analyser(this.props.context, this.props.playerGroups.bass.effectsChainExit, {
                effectsChain: this.props.effectsChain,
                power: 5,
                smoothingTimeConstant: .70
            });

            vizConfig.rhythm.players = this.props.players.filter((player) => {return player.groupName === 'rhythm'});
            vizConfig.atmosphere.players = this.props.players.filter((player) => {return player.groupName === 'atmosphere'});
            vizConfig.melody.players = this.props.players.filter((player) => {return player.groupName === 'melody'});
            vizConfig.harmony.players = this.props.players.filter((player) => {return player.groupName === 'harmony'});
            vizConfig.bass.players = this.props.players.filter((player) => {return player.groupName === 'bass'});

            const manager = new Lake(this.state.canvas, vizConfig);

            this.setState(() => {
                return {manager, flagCanvasLoaded: true};
            })
        }
    }

    render() {
        return <canvas id = 'canvas-viz'/>
    }
}