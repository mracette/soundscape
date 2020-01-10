// libs
import React from 'react';

// styles
import '../styles/components/EffectsPanel.scss';

const EffectsPanel = (props) => {

    const handleReset = () => {
        // reset hp
        document.getElementById('hp-slider').value = 1;
        props.handleChangeHP(1);

        // reset lp
        document.getElementById('lp-slider').value = 100;
        props.handleChangeLP(100);

        // reset spaciousness
        document.getElementById('spaciousness-slider').value = 1;
        props.handleChangeSpaciousness(1);
    }

    React.useEffect(handleReset, []);

    return (

        <div id='effects-panel'>

            <h2>Effects</h2>

            <div>
                <button
                    id='effects-panel-reset'
                    onClick={handleReset}
                >
                    Reset
                    </button>

                <button
                    id='effects-panel-randomize'
                    onClick={props.handleEffectsRandomize}
                >
                    Randomize
                    </button>
            </div>

            <div>
                <h3 className='slider-label'>highpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="hp-slider"
                    onInput={(e) => {
                        e.preventDefault();
                        props.handleChangeHP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>lowpass filter</h3>
                <input type="range" min="1" max="100" className="slider" id="lp-slider"
                    onInput={(e) => {
                        e.preventDefault();
                        props.handleChangeLP(e.target.value);
                    }}
                ></input>
                <h3 className='slider-label'>space</h3>
                <input type="range" min="1" max="100" className="slider" id="spaciousness-slider"
                    onInput={(e) => {
                        e.preventDefault();
                        props.handleChangeSpaciousness(e.target.value);
                    }}
                ></input>
            </div>

        </div>
    );
}

export default EffectsPanel;