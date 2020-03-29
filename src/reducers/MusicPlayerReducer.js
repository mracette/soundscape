export const MusicPlayerReducer = (state, action) => {
  switch (action.type) {
    case "setIsLoading":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "startBackgroundMode":
      return {
        ...state,
        backgroundMode: true,
      };
    case "stopBackgroundMode":
      return {
        ...state,
        backgroundMode: false,
      };
    case "setBackgroundMode":
      return {
        ...state,
        backgroundMode: action.payload,
      };
    case "addPlayer":
      if (state.players.find((p) => p.id === action.payload.player.id)) {
        return state;
      } else {
        return {
          ...state,
          players: [...state.players, action.payload.player],
        };
      }
    case "addAnalyser":
      if (state.analysers.find((a) => a.id === action.payload.analyser.id)) {
        return state;
      } else {
        return {
          ...state,
          analysers: [...state.analysers, action.payload.analyser],
        };
      }
    case "updatePlayerState":
      return {
        ...state,
        players: [
          ...state.players.filter((p) => p.id !== action.payload.id),
          {
            ...state.players.find((p) => p.id === action.payload.id),
            playerState: action.payload.newState,
          },
        ],
      };
    case "startMute":
      return {
        ...state,
        mute: true,
      };
    case "stopMute":
      return {
        ...state,
        mute: false,
      };
    case "addImpulseResponse":
      return {
        ...state,
        impulseResponses: [
          ...state.impulseResponses,
          action.payload.impulseResponse,
        ],
      };
    case "incrementHighpass":
      return {
        ...state,
        highpass: state.highpass + action.payload.value,
      };
    case "incrementLowpass":
      return {
        ...state,
        lowpass: state.lowpass + action.payload.value,
      };
    case "incrementAmbience":
      return {
        ...state,
        ambience: state.ambience + action.payload.value,
      };
    case "setHighpass":
      return {
        ...state,
        highpass: action.payload.value,
      };
    case "setLowpass":
      return {
        ...state,
        lowpass: action.payload.value,
      };
    case "setAmbience":
      return {
        ...state,
        ambience: action.payload.value,
      };
    case "setPauseVisuals":
      return {
        ...state,
        pauseVisuals: action.payload,
      };
    default:
      return state;
  }
};
