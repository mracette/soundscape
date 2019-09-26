import React, {useRef} from 'react'

import icons from '../assets/svg/iconList.svg';

import '../styles/components/Icon.scss';

const Icon = props => {

    const iconRef = useRef(null);

    if(props.handleAddIconRef) {props.handleAddIconRef(iconRef)};

	return (
        <div id = 'scale-div' className = {`icon ${props.classList}`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                className={`icon ${props.classList}`}
                style = {props.styles}
                id={`icon-${props.name}`}
            >
			<use ref = {iconRef} xlinkHref={`${icons}#${props.name}`} />
		    </svg>
        </div>
	)
}

export default Icon;