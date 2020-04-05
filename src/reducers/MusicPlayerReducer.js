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
    case "setPauseVisuals":
      return {
        ...state,
        pauseVisuals: action.payload,
      };
    default:
      return state;
  }
};
