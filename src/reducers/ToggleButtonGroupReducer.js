export const ToggleButtonGroupReducer = (state, action) => {
  switch (action.type) {
    case "incrementPolyphony": {
      return {
        ...state,
        polyphony: state.polyphony + 1,
      };
    }
    case "decrementPolyphony": {
      return {
        ...state,
        polyphony: state.polyphony - 1,
      };
    }
    case "addPlayer": {
      return {
        ...state,
        players: [...state.players, action.payload.player],
      };
    }
    case "updatePlayerState": {
      let increment;
      if (action.payload.newState === "pending-start") {
        increment = 1;
      } else if (action.payload.newState === "pending-stop") {
        increment = -1;
      } else {
        increment = 0;
      }
      return {
        ...state,
        polyphony: state.polyphony + increment,
        players: [
          ...state.players.filter((p) => p.id !== action.payload.id),
          {
            ...state.players.find((p) => p.id === action.payload.id),
            playerState: action.payload.newState,
          },
        ],
      };
    }
    case "updatePlayerOrder": {
      if (action.payload.newState === "pending-start") {
        if (
          state.maxPolyphony === -1 ||
          state.polyphony <= state.maxPolyphony
        ) {
          // add this player to the end of the playerOrder list
          return {
            ...state,
            playerOrder: state.playerOrder.concat([action.payload.playerId]),
          };
        } else {
          // override the latest player to be added to the list, then append the new one
          return {
            ...state,
            playerOverrides: [state.playerOrder[0]],
            playerOrder: state.playerOrder
              .slice(1)
              .concat([action.payload.playerId]),
          };
        }
      } else if (action.payload.newState === "pending-stop") {
        // remove the player from the playerOrder list
        return {
          ...state,
          playerOrder: state.playerOrder.filter(
            (p) => p !== action.payload.playerId
          ),
        };
      } else {
        return state;
      }
    }
    case "updatePlayerOverrides": {
      return {
        ...state,
        playerOverrides: state.playerOverrides.filter(
          (p) => p !== action.payload.playerId
        ),
      };
    }
    default:
      return state;
  }
};
