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
    case "addVoice":
      return {
        ...state,
        voices: [...state.voices, action.payload],
      };
    case "updateVoiceState":
      return {
        ...state,
        voices: [
          ...state.voices.filter((v) => v.id !== action.payload.id),
          {
            ...state.voices.find((v) => v.id === action.payload.id),
            voiceState: action.payload.newState,
          },
        ],
      };
    case "addAnalyser":
      if (state.analysers.find((a) => a.id === action.payload.analyser.id)) {
        return state;
      } else {
        return {
          ...state,
          analysers: [...state.analysers, action.payload.analyser],
        };
      }
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
    case "addGroupSolo":
      return {
        ...state,
        groupSolos: [action.payload],
      };
    case "removeGroupSolo":
      return {
        ...state,
        groupSolos: [],
      };
    case "setPauseVisuals":
      return {
        ...state,
        pauseVisuals: action.payload,
      };
    case "addResetCallback": {
      const newState = state.resetCallbacks.filter(
        (obj) => obj.name !== action.payload.name
      );
      newState.push(action.payload);
      return {
        ...state,
        resetCallbacks: newState,
      };
    }
    case "addRandomizeCallback": {
      const newState = state.randomizeCallbacks.filter(
        (obj) => obj.name !== action.payload.name
      );
      newState.push(action.payload);
      return {
        ...state,
        randomizeCallbacks: newState,
      };
    }
    default:
      return state;
  }
};
