// libs
import React, { useState, useEffect, useRef, useContext } from 'react';

// components
import { MenuButtonChild } from './MenuButtonChild';
import { Icon } from './Icon';

// contexts
import { ThemeContext } from '../contexts/ThemeContext';
import { LayoutContext } from '../contexts/LayoutContext';

// styles
import '../styles/components/MenuButtonParent.scss';

export const MenuButtonParent = (props) => {

    const { vw, vh } = useContext(LayoutContext);
    const { backgroundColor } = useContext(ThemeContext);

    // parent button dimensions
    const height = 7 * vh;
    const width = height;

    // div position
    const top = 2.5 * vh;
    const left = top;

    const childHeight = 0.6 * height;
    const childWidth = childHeight;

    const separation = childWidth;

    // track elements inside the menu
    const node = useRef();

    // set state
    const [isOpen, setIsOpen] = useState(true);
    const [openChildIndex, setOpenChildIndex] = useState(-1);
    const numOfChildren = props.childButtonProps.length;

    // handle click events outside of the node's dom
    const handleOutsideClick = (e) => {
        if (!node.current.contains(e.target)) {
            // if a child menu is open, close it
            if (openChildIndex !== -1) {
                setOpenChildIndex(-1);
                return;
                // if child menus are all close, close the parent menu
            } else if (isOpen) {
                setIsOpen(false);
                return;
            }
        }
    }

    // add and remove event listeners to handle outside clicks
    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        } else {
            document.removeEventListener('mousedown', handleOutsideClick);
        }
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, openChildIndex]);

    return (

        <div
            className='menu-button'
            style={{
                top,
                left
            }}
            ref={node}
        >

            <button
                className={isOpen ? `menu-button-parent menu-button-parent-open` : `menu-button-parent`}
                style={{
                    zIndex: numOfChildren + 1,
                    width,
                    height,
                    background: backgroundColor
                }}
                onClick={(e) => {
                    e.preventDefault();
                    isOpen && setOpenChildIndex(-1);
                    props.clickToOpen && setIsOpen(!isOpen);
                }}
            >
                <Icon
                    divClassList={isOpen ? 'icon-white rotate45' : 'icon-white'}
                    svgClassList={'icon-white'}
                    name='icon-plus'
                />
            </button>

            {props.childButtonProps.map((child, index) => (

                <MenuButtonChild

                    // button content
                    id={child.id}
                    key={child.id}
                    content={props.childButtonProps[index].content}

                    // button appearance
                    iconName={child.iconName}
                    autoOpen={child.autoOpen}
                    icon={child.icon}
                    direction={props.direction}
                    index={index + 1}
                    openChildIndex={openChildIndex}
                    setOpenChildIndex={setOpenChildIndex}
                    zIndex={numOfChildren - index}
                    separation={separation}
                    width={childWidth}
                    height={childHeight}
                    parentWidth={width}
                    parentHeight={height}
                    menuWidth={width + (childWidth + separation) * (numOfChildren - 1)}
                    parentIsOpen={isOpen}

                />

            ))}

        </div>
    )

}