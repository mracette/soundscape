
const ParentMenuButtonReducer = (state, action) => {
    switch (action.type) {
        case 'CLOSE_PARENT_MENU': return { ...state, isOpen: false, openChildIndex: -1 };
        case 'OPEN_PARENT_MENU': return { ...state, isOpen: true };
        case 'SET_OPEN_CHILD_INDEX': return { ...state, openChildIndex: action.payload };
        default: throw new Error();
    }
}

export { ParentMenuButtonReducer };