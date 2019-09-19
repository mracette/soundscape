import React from 'react';
import '../styles/components/EffectsPanel.scss';

const EffectsPanel = (props) => {

        return (

            <div id = 'effects-panel'>

                <h2>Effects</h2>

                <div>
                    <button id = 'effects-panel-reset'>
                        Reset
                    </button>

                    <button id = 'effects-panel-randomize'>
                        Randomize
                    </button>
                </div>

                <div>
                <h3 className='slider-label'>highpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="hp-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        //this.props.handleChangeHP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>lowpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="lp-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        //this.props.handleChangeLP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>ambience</h3>
                <input type="range" min="1" max="100" className="slider" id="ambience-slider"
                    onInput = {(e) => {
                        e.preventDefault();
                        //this.props.handleChangeAmbience(e.target.value);
                    }}
                ></input>
                </div>

            </div>
        );
}

export default EffectsPanel;