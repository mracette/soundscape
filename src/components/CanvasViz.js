import React from 'react';
import SceneManager from '../viz/SceneManager';

export default class CanvasViz extends React.Component {
    constructor(props){
        super(props)
        const canvas = document.getElementById('canvas-viz');
        const manager = new SceneManager(canvas);
    }

    render() {
        return (
            <div></div>
        )
    }
}