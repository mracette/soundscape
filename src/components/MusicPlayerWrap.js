// libs
import React from 'react';

// components
import { MusicPlayer } from './MusicPlayer';

// context
import { LayoutContext } from '../contexts/contexts';
import { ThemeContext } from '../contexts/contexts';
import { MusicPlayerContext } from '../contexts/contexts';
import { TestingContext } from '../contexts/contexts';

// loads configs, inits globals vars, adds listeners, and manages some other settings
export const MusicPlayerWrap = (props) => {

  return (
    <TestingContext.Consumer>
      {testingContext => (
        <LayoutContext.Consumer>
          {layoutContext => (
            <ThemeContext.Consumer>
              {themeContext => (
                <MusicPlayerContext.Consumer>
                  {musicPlayerContext => (
                    <MusicPlayer
                      testingContext={testingContext}
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
      )}
    </TestingContext.Consumer>
  );

}