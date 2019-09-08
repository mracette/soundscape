import React, { useState, useEffect, useReducer } from 'react';
import ClassNames from 'classnames';
import '../styles/components/MenuButtonContentWrapper.scss';

const MenuButtonContentWrapper = (props) => {

    const classPrefix = 'menu-button-content'
    const classNames = ClassNames({
        [classPrefix]: true
    });

    return (
        <div 
            className = {classNames}
            style = {{
                display: !props.parentIsOpen && 'none',
                marginTop: props.marginTop,
                minWidth: props.minWidth
            }}
            >
            
            {props.content}

        </div>
    );
}

export default MenuButtonContentWrapper;