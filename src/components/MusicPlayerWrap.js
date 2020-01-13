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
      {TestingContext => (
        <LayoutContext.Consumer>
          {LayoutContext => (
            <ThemeContext.Consumer>
              {ThemeContext => (
                <MusicPlayerContext.Consumer>
                  {MusicPlayerContext => (
                    <MusicPlayer
                      TestingContext={TestingContext}
                      LayoutContext={LayoutContext}
                      ThemeContext={ThemeContext}
                      MusicPlayerContext={MusicPlayerContext}
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