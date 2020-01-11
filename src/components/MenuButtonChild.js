// libs
import React from 'react';

// components
import { MenuButtonContentWrapper } from './MenuButtonContentWrapper';
import { Icon } from '../components/Icon';

// contexts
import { ThemeContext } from '../contexts/ThemeContext';

// styles
import '../styles/components/MenuButtonChild.scss';

export const MenuButtonChild = (props) => {

    const { autoOpen, setOpenChildIndex, index } = props;

    const { backgroundColor } = React.useContext(ThemeContext);

    // track state
    const [isOpen, setIsOpen] = React.useState(false);

    // if another button in the set is open, close this button
    React.useEffect(() => { props.openChildIndex !== props.index && setIsOpen(false) }, [props.openChildIndex, props.index])

    // open button once if autoOpen === true
    React.useEffect(() => {
        if (autoOpen) {
            setOpenChildIndex(index);
            setIsOpen(true);
        }
    }, [autoOpen, setOpenChildIndex, index])

    // calculate the margin needed to expand this child to its outward position
    const marginStyle = ((props.parentWidth + props.width) / 2) + props.separation + (2 * props.separation * (props.index - 1));

    // assign classes
    const classPrefix = 'menu-button-child'

    let classList = classPrefix;

    if (props.parentIsOpen) { classList += ` ${classPrefix}-expand` }
    if (isOpen) { classList += ` ${classPrefix}-open` }

    return (
        <>
            <button
                className={classList}
                onClick={(e) => {
                    e.preventDefault();
                    if (isOpen) {
                        // tell the parent that this button is closed
                        props.setOpenChildIndex(-1);
                    } else {
                        // tell the parent that this button is open, which closes other buttons
                        props.setOpenChildIndex(props.index)
                    }
                    setIsOpen(!isOpen);
                }}
                style={{
                    backgroundColor,
                    width: props.width,
                    height: props.height,
                    top: (props.parentHeight - props.height) / 2,
                    left: (props.parentWidth - props.width) / 2,
                    marginLeft: props.direction === 'right' && props.parentIsOpen ? marginStyle : 0,
                    marginRight: props.direction === 'left' && props.parentIsOpen ? marginStyle : 0,
                    marginTop: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                    marginBottom: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                    zIndex: props.zIndex
                }}
            >
                {props.name}

                <Icon
                    divClassList={'icon-white'}
                    svgClassList={'icon-white'}
                    name={props.iconName}
                />

            </button>

            {/* Arrow
            - connects button to content
            - size matches button size
            - uses a CSS trick to create an arrow with borders https://css-tricks.com/snippets/css/css-triangle/
            - TODO: implement arrow directionality based on which side the content is display and how the menu opens
            */}
            <div
                className='arrow'
                style={{
                    borderBottomColor: backgroundColor,
                    display: !isOpen && 'none',
                    top: props.height + (props.parentHeight - props.height) / 2,
                    left: (props.parentWidth - props.width) / 2 - props.parentHeight / 8,
                    marginLeft: props.direction === 'right' && props.parentIsOpen ? marginStyle : 0,
                    marginRight: props.direction === 'left' && props.parentIsOpen ? marginStyle : 0,
                    marginTop: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                    marginBottom: props.direction === 'down' && props.parentIsOpen ? marginStyle : 0,
                    borderRightWidth: props.parentHeight / 4 + (props.parentHeight - props.height) / 2,
                    borderBottomWidth: props.parentHeight / 4 + (props.parentHeight - props.height) / 2,
                    borderLeftWidth: props.parentHeight / 4 + (props.parentHeight - props.height) / 2
                }}
            />

            {/* Content
            - allows content to be passed down the tree and displayed by the button
            - width is at least as big as the expanded menu
            */}
            <MenuButtonContentWrapper
                content={props.content}
                config={props.config}
                parentIsOpen={isOpen}
                minWidth={props.menuWidth + props.width}
                marginTop={props.parentHeight / 4}
            />

        </>
    )

}