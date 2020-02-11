// libs
import React from 'react';

// components
import { Icon } from '../../components/Icon';

// styles
import '../../styles/components/Icon.scss';

export const SocialIcons = () => {

    return (
        <div id='social-icons' className='icon-row flex-row'>
            <Icon
                divClassList={'icon-white icon-row-child'}
                svgClassList={'icon-white icon-row-child'}
                name='icon-envelope'
                link='mailto:mark@soundscape.world'
            />
            <Icon
                divClassList={'icon-white icon-row-child'}
                svgClassList={'icon-white icon-row-child'}
                name='icon-twitter'
                link='https://twitter.com/markracette'
            />
            <Icon
                divClassList={'icon-white icon-row-child'}
                svgClassList={'icon-white icon-row-child'}
                name='icon-instagram'
                link='https://instagram.com/rgb.ig'
            />
            <Icon
                divClassList={'icon-white icon-row-child'}
                svgClassList={'icon-white icon-row-child'}
                name='icon-github'
                link='https://github.com/mracette'
            />
        </div>
    );

}