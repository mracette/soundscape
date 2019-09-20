/* eslint-disable */ 

import React, { useState, useEffect, useReducer } from 'react';
import ClassNames from 'classnames';
import MenuButtonContentWrapper from './MenuButtonContentWrapper';
import '../styles/components/MenuButtonChild.scss';

const MenuButtonChild = (props) => {

    // track state
    const [isOpen, setIsOpen] = useState(false);

    // if another button in the set is open, close this button
    useEffect(() => { props.openChildIndex !== props.index && setIsOpen(false) }, [props.openChildIndex])

    // open button once if autoOpen === true
    useEffect(() => {
        if(props.autoOpen) {
            props.setOpenChildIndex(props.index);
            setIsOpen(!isOpen);
        }
    }, [])

    // calculate the margin needed to expand this child to its outward position
    const marginStyle = `calc(${props.separation} * ${props.index} + (${props.parentSize} - ${props.size}) / 2)`;

    // assign classes
    const classPrefix = 'menu-button-child';
    const classNames = ClassNames({
        [classPrefix]: true,
        [`${classPrefix}-expand`]: props.parentIsOpen,
        [`${classPrefix}-open`]: isOpen,
    });

    return (
        <>
        {/* Button
            - takes size from props.size
            - calculates margin based on props.separation
            - supports different directions for expansion
        */}
        <button 
            className = { classNames }
            onClick = { (e) => {
                e.preventDefault();
                if(isOpen) {
                    // tell the parent that this button is closed
                    props.setOpenChildIndex(-1);
                } else{
                    // tell the parent that this button is open, which closes other buttons
                    props.setOpenChildIndex(props.index)
                }
                setIsOpen(!isOpen);
            }}
            style = {{
                width: props.size,
                height: props.size,
                top: `calc((${props.parentSize} - ${props.size}) / 2)`,
                left: `calc((${props.parentSize} - ${props.size}) / 2)`,
                marginLeft: props.direction === 'right' && props.parentIsOpen ? marginStyle : 0,
                marginRight: props.direction === 'left' && props.parentIsOpen ? marginStyle : 0,
                marginTop: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                marginBottom: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                zIndex: props.zIndex
            }}
            >
            {props.name}
        </button>
        
        {/* Arrow
            - connects button to content
            - size matches button size
            - uses a CSS trick to create an arrow with borders https://css-tricks.com/snippets/css/css-triangle/
            - TODO: implement arrow directionality based on which side the content is display and how the menu opens
        */}
        <div 
            className = 'arrow' 
            style = {{
                display: !isOpen && 'none',
                top: `calc((${props.parentSize} + ${props.size}) / 2)`,
                left: `calc((${props.parentSize} - ${props.size}) / 2)`,
                marginLeft: props.direction === 'right' && props.parentIsOpen ? marginStyle : 0,
                marginRight: props.direction === 'left' && props.parentIsOpen ? marginStyle : 0,
                marginTop: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                marginBottom: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                borderRightWidth: `calc(${props.size} / 2)`,
                borderBottomWidth: `calc(${props.size} / 2)`,
                borderLeftWidth: `calc(${props.size} / 2)`
            }}
        />

        {/* Content
            - allows content to be passed down the tree and displayed by the button
            - width is at least as big as the expanded menu
        */}
        <MenuButtonContentWrapper
            content = { props.content }
            config = { props.config }
            parentIsOpen = { isOpen }
            minWidth = { props.parentWidth }
            marginTop = { `calc((
                ( ${props.parentSize} - ${props.size}) / -2 ) + 
                ( ${props.size} / 2)
            )`}
        />

        </>
    )

}

export default MenuButtonChild;