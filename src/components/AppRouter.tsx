import { Switch, Route } from "wouter";
import { ThemeContext, ThemeContextValue, SongContextValue, InfoContextValue, AppConfigEntry } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";
import { MusicPlayer } from "./MusicPlayer";
import { LandingPage } from "./LandingPage";

interface Props {
  appConfig: AppConfigEntry[];
  spectrumFunctions: Record<string, (n: number) => unknown>;
}

export const AppRouter = (props: Props) => {
  return (
    <Switch>
      <Route path="/play/:songId">
        {(params) => {
          const songId = params.songId as string;
          return (
            <ThemeContext.Provider
              value={{
                id: songId,
                spectrumFunction: props.spectrumFunctions[songId],
                ...props.appConfig.find((song) => {
                  return song.id === songId;
                })!["themes"],
              } as ThemeContextValue}
            >
              <SongContext.Provider
                value={{
                  id: songId,
                  ...props.appConfig.find((song) => {
                    return song.id === songId;
                  })!["audio"],
                } as SongContextValue}
              >
                <InfoContext.Provider
                  value={{
                    id: songId,
                    ...props.appConfig.find((song) => {
                      return song.id === songId;
                    })!["info"],
                  } as InfoContextValue}
                >
                  <MusicPlayer />
                </InfoContext.Provider>
              </SongContext.Provider>
            </ThemeContext.Provider>
          );
        }}
      </Route>
      <Route>
        <LandingPage spectrumFunction={props.spectrumFunctions.stars} />
      </Route>
    </Switch>
  );
};
