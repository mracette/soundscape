// libs
import React from 'react';

// components
import MusicPlayer from './MusicPlayer';

// context
import LayoutContext from '../contexts/LayoutContext';
import ThemeContext from '../contexts/ThemeContext';
import MusicPlayerContext from '../contexts/MusicPlayerContext';

// loads configs, inits globals vars, adds listeners, and manages some other settings
const MusicPlayerWrap = (props) => {

  return (
    <LayoutContext.Consumer>
      {layoutContext => (
        <ThemeContext.Consumer>
          {themeContext => (
            <MusicPlayerContext.Consumer>
              {musicPlayerContext => (
                <MusicPlayer
                  layoutContext={layoutContext}
                  themeContext={themeContext}
                  musicPlayerContext={musicPlayerContext}
                />
              )}
            </MusicPlayerContext.Consumer>
          )}
        </ThemeContext.Consumer>
      )}
    </LayoutContext.Consumer >
  );

}

export default MusicPlayerWrap;
