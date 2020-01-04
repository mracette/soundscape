// libs
import React, { useContext } from 'react';

// contexts
import LayoutContext from '../contexts/LayoutContext';
import ThemeContext from '../contexts/ThemeContext';

// styles
import '../styles/components/MenuButtonContentWrapper.scss';

const MenuButtonContentWrapper = (props) => {

    const { vw, vh } = useContext(LayoutContext);
    const { backgroundColor } = useContext(ThemeContext);

    return (
        <div
            className='menu-button-content'
            style={{
                backgroundColor,
                display: !props.parentIsOpen && 'none',
                marginTop: props.marginTop,
                minWidth: props.minWidth,
                maxHeight: 82 * vh,
                maxWidth: 95 * vw,
                padding: 4 * vh,
            }}
        >

            {props.content}

        </div>
    );
}

export default MenuButtonContentWrapper;