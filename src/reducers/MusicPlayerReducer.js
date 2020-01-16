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
            }
    }
}