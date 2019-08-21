import React from 'react';
import * as d3Chromatic from 'd3-scale-chromatic';

export default class Sliders extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        document.getElementById('hp-slider').value = 1;
        document.getElementById('lp-slider').value = 100;
        document.getElementById('ambience-slider').value = 1;
    }

    render() {
        return (
            <div>
                <h3 className='slider-label'>highpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="hp-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        this.props.handleChangeHP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>lowpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="lp-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        this.props.handleChangeLP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>ambience</h3>
                <input type="range" min="1" max="100" className="slider" id="ambience-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        this.props.handleChangeAmbience(e.target.value);
                    }}
                ></input>
            </div>
        );
    }
}