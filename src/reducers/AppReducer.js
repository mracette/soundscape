export const AppReducer = (state, action) => {
  switch (action.type) {
    case "setIsLoading":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};
