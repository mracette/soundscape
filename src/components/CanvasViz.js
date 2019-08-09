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

            // create a deep copy of the groupPlayers obj
            const groupPlayersArray = JSON.parse(JSON.stringify(this.props.playerGroups));

            // this should only run once per song load
            for (let i = 0; i < this.props.players.length; i++) {
                const player = this.props.players[i];
                if(groupPlayersArray[player.groupName] === undefined) {groupPlayersArray[player.groupName] = [];}
                groupPlayersArray[player.groupName].push(player.player)
            }

            // TODO: move analyser params to config file           
                const rhythm = new Analyser(this.props.context, groupPlayersArray.rhythm, {
                    power: 7
                });
                const atmosphere = new Analyser(this.props.context, groupPlayersArray.atmosphere, {
                    split: true,
                    smoothingTimeConstant: 0.2,
                    power: 5,
                    minFrequency: 200,
                    maxFrequency: 10500
                });
                const melody = new Analyser(this.props.context, groupPlayersArray.melody, {
                    power: 5,
                    minFrequency: 200,
                    maxFrequency: 10500
                });
                const harmony = new Analyser(this.props.context, groupPlayersArray.harmony, {
                    power: 9,
                    smoothingTimeConstant: 0.95
                });
                const bass = new Analyser(this.props.context, groupPlayersArray.bass, {
                    power: 5,
                    minFrequency: 25,
                    maxFrequency: 500
                });

                const analyserArray = [];
                analyserArray.push({
                    id: 'rhythm',
                    analyser: rhythm
                },
                {
                    id: 'atmosphere',
                    analyser: atmosphere
                },
                {
                    id: 'melody',
                    analyser: melody
                },
                {
                    id: 'harmony',
                    analyser: harmony
                },
                {
                    id: 'bass',
                    analyser: bass
                })

                const manager = new Lake(this.state.canvas, analyserArray);

                this.setState(() => {
                    return {manager, flagCanvasLoaded: true};
                })
        }
    }

    render() {
        return <canvas id = 'canvas-viz'/>
    }
}