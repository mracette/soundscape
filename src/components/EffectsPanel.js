// libs
import React from 'react';
// import anime from 'animejs';

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

            <h2>Background Mode</h2>
            <p>Automatically varies the music. Ideal for extended listening.</p>

            <div className='flex-row slider-row'>
                <div className='flex-col'>
                    <span><h3>Voices:</h3></span>
                </div>
                <div className='flex-col' style={{ justifyContent: 'flex-end' }}>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>
            <div className='flex-row slider-row'>
                <div className='flex-col'>
                    <span><h3>Effects:cd</h3></span>
                </div>
                <div className='flex-col'>
                    <label className="switch">
                        <input type="checkbox" />
                        <span className="slider round"></span>
                    </label>
                </div>
            </div>

            <h2 id='effects-controls-row'>Effects Controls</h2>

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
                <input type="range" min="1" max="100" disabled={randomizeEffects} id="hp-slider" ref={hpRef}
                    onInput={(e) => {
                        dispatch({ type: 'setHighpass', payload: { value: parseInt(e.target.value) } });
                    }}
                ></input>
            </div>
            <div className='flex-row'>
                <h3 className='slider-label'>lowpass filter</h3>
            </div>
            <div className='flex-row'>
                <input type="range" min="1" max="100" disabled={randomizeEffects} id="lp-slider" ref={lpRef}
                    onInput={(e) => {
                        dispatch({ type: 'setLowpass', payload: { value: parseInt(e.target.value) } });
                    }}
                ></input>
            </div>
            <div className='flex-row'>
                <h3 className='slider-label'>ambience</h3>
            </div>
            <div className='flex-row'>
                <input type="range" min="1" max="100" disabled={randomizeEffects} id="spaciousness-slider" ref={ambienceRef}
                    onChange={(e) => {
                        dispatch({ type: 'setAmbience', payload: { value: parseInt(e.target.value) } });
                    }}
                ></input>
            </div>

        </div >
    );
}