// libs
import React from 'react';
import anime from 'animejs';

// context
import { MusicPlayerContext } from '../contexts/contexts';

// styles
import '../styles/components/EffectsPanel.scss';

export const EffectsPanel = (props) => {

    const hpRef = React.useRef();
    const lpRef = React.useRef();
    const ambienceRef = React.useRef();

    const { dispatch, randomizeEffects } = React.useContext(MusicPlayerContext);

    const handleReset = React.useCallback(() => {

        // reset hp
        hpRef.current.value = 1;
        dispatch({ type: 'setHighpass', payload: { value: 1 } })

        // reset lp
        lpRef.current.value = 100;
        dispatch({ type: 'setLowpass', payload: { value: 100 } })

        // reset spaciousness
        ambienceRef.current.value = 1;
        dispatch({ type: 'setAmbience', payload: { value: 1 } })

    }, [dispatch]);

    React.useEffect(() => handleReset(), [handleReset]);

    return (

        <div id='effects-panel' className='flex-panel'>

            <h2>Effects</h2>

            <div className='flex-row'>
                <button
                    className='button-white grouped-buttons'
                    id='effects-panel-reset'
                    onClick={() => handleReset()}
                >
                    Reset
                    </button>

                {/* <button
                    id='effects-panel-randomize'
                    onClick={() => dispatch({ type: 'setRandomizeEffects', payload: !randomizeEffects })}
                >
                    Background Mode
                    </button> */}

                <button
                    className='button-white grouped-buttons'
                    id='effects-panel-randomize'
                    onClick={() => {

                        const h = 1 + 99 * Math.random();
                        const l = 1 + 99 * Math.random();
                        const a = 1 + 99 * Math.random();

                        dispatch({ type: 'setHighpass', payload: { value: h } });
                        dispatch({ type: 'setLowpass', payload: { value: l } });
                        dispatch({ type: 'setAmbience', payload: { value: a } });

                        hpRef.current.value = h;
                        lpRef.current.value = l;
                        ambienceRef.current.value = a;

                    }
                    }>
                    Randomize
                    </button>
            </div>

            <div className='flex-row'>
                <h3 className='slider-label'>highpass filter</h3>
            </div>
            <div className='flex-row'>
                <input type="range" min="1" max="100" disabled={randomizeEffects} className="slider" id="hp-slider" ref={hpRef}
                    onInput={(e) => {
                        dispatch({ type: 'setHighpass', payload: { value: e.target.value } });
                    }}
                ></input>
            </div>
            <div className='flex-row'>
                <h3 className='slider-label'>lowpass filter</h3>
            </div>
            <div className='flex-row'>
                <input type="range" min="1" max="100" disabled={randomizeEffects} className="slider" id="lp-slider" ref={lpRef}
                    onInput={(e) => {
                        dispatch({ type: 'setLowpass', payload: { value: e.target.value } });
                    }}
                ></input>
            </div>
            <div className='flex-row'>
                <h3 className='slider-label'>ambience</h3>
            </div>
            <div className='flex-row'>
                <input type="range" min="1" max="100" disabled={randomizeEffects} className="slider" id="spaciousness-slider" ref={ambienceRef}
                    onChange={(e) => {
                        dispatch({ type: 'setAmbience', payload: { value: e.target.value } });
                    }}
                ></input>
            </div>

        </div >
    );
}