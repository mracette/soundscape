// libs
import React from "react";
import { Switch, Route } from "wouter";

// context
import { ThemeContext } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";

// components
import { MusicPlayer } from "./MusicPlayer";
import { LandingPage } from "./LandingPage";

export const AppRouter = (props) => {
  return (
    <Switch>
      <Route path="/play/:songId">
        {(params) => (
          <ThemeContext.Provider
            value={{
              // provide the song's theme context
              id: params.songId,
              spectrumFunction: props.spectrumFunctions[params.songId],
              ...props.appConfig.find((song) => {
                return song.id === params.songId;
              })["themes"],
            }}
          >
            <SongContext.Provider
              value={{
                // provide the song context
                id: params.songId,
                ...props.appConfig.find((song) => {
                  return song.id === params.songId;
                })["audio"],
              }}
            >
              <InfoContext.Provider
                value={{
                  // provide extra information about the song
                  id: params.songId,
                  ...props.appConfig.find((song) => {
                    return song.id === params.songId;
                  })["info"],
                }}
              >
                <MusicPlayer />
              </InfoContext.Provider>
            </SongContext.Provider>
          </ThemeContext.Provider>
        )}
      </Route>
      <Route>
        <LandingPage spectrumFunction={props.spectrumFunctions.stars} />
      </Route>
    </Switch>
  );
};
