export const MusicPlayerReducer = (state, action) => {
    switch (action.type) {
        case 'startRandomize':
            return {
                ...state,
                randomize: true
            };
        case 'stopRandomize':
            return {
                ...state,
                randomize: false
            };
        case 'setRandomizeEffects':
            return {
                ...state,
                randomizeEffects: action.payload
            };
        case 'resetPlayers':
            state.players.forEach((p) => {
                if (p.instance.state.playerState === 'active') { p.instance.stopPlayer(false, true); }
                if (p.instance.state.playerState === 'pending-start') { p.instance.pendingStop(false, true); }
            })
            return state;
        case 'addPlayer':
            return {
                ...state,
                players: [...state.players, action.payload.player]
            };
        case 'addButton':
            return {
                ...state,
                buttons: [...state.buttons, action.payload.button]
            }
        case 'addAnalyser':
            return {
                ...state,
                analysers: [...state.analysers, action.payload.analyser]
            };
        case 'updatePlayerState':
            return {
                ...state,
                players: [
                    ...state.players.filter((p) => p.id !== action.payload.id),
                    { ...state.players.find((p) => p.id === action.payload.id), playerState: action.payload.newState }
                ]
            };
        case 'startMute':
            return {
                ...state,
                mute: true
            };
        case 'stopMute':
            return {
                ...state,
                mute: false
            };
        case 'addImpulseResponse':
            return {
                ...state,
                impulseResponses: [
                    ...state.impulseResponses,
                    action.payload.impulseResponse
                ]
            };
        case 'addEffect':
            switch (action.payload.effectType) {
                case 'highpass':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            highpass: [...state.groupEffects.highpass, action.payload.effect]
                        }
                    };
                case 'lowpass':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            lowpass: [...state.groupEffects.lowpass, action.payload.effect]
                        }
                    };
                case 'reverb-dry':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            reverbDry: [...state.groupEffects.reverbDry, action.payload.effect]
                        }
                    };
                case 'reverb-wet':
                    return {
                        ...state,
                        groupEffects: {
                            ...state.groupEffects,
                            reverbWet: [...state.groupEffects.reverbWet, action.payload.effect]
                        }
                    };
                default: return state;
            }
        case 'incrementHighpass':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    highpass: state.effectValues.highpass + action.payload.value
                }
            };
        case 'incrementLowpass':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    lowpass: state.effectValues.lowpass + action.payload.value
                }
            };
        case 'incrementAmbience':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    ambience: state.effectValues.ambience + action.payload.value
                }
            };
        case 'setHighpass':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    highpass: action.payload.value
                }
            };
        case 'setLowpass':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    lowpass: action.payload.value
                }
            };
        case 'setAmbience':
            return {
                ...state,
                effectValues: {
                    ...state.effectValues,
                    ambience: action.payload.value
                }
            };
        default: return state;
    }
}