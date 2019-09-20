export const PlayersReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_PLAYER':
            return [...state,
                {
                    name: action.name,
                    player: action.player
                }
            ];
        case 'REMOVE_PLAYER':
            return state.filter((player) => {
                return player.name !== action.name;
            });
    }
}