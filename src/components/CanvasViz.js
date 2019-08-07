import React from 'react';
import SceneManager from '../viz/SceneManager';
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
        if(this.props.flagPlayersLoaded && !this.state.flagCanvasLoaded) {
            // TODO: move analyser params to config file           
            this.setState(() => {
                const analyserArray = [];
                const kickSnare1 = new Analyser(this.props.context, this.props.players[0].player, {
                    power: 8
                });
                analyserArray.push({
                    id: this.props.players[0].id,
                    analyser: kickSnare1
                })
                const manager = new Lake(this.state.canvas, analyserArray);
                return {manager, flagCanvasLoaded: true};
                })
        }
    }

    render() {
        return <canvas id = 'canvas-viz'/>
    }
}