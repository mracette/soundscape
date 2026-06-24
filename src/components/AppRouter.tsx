import { Switch, Route, Redirect } from "wouter";
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
          const song = props.appConfig.find((s) => s.id === songId);
          if (!song) {
            return <Redirect to="/" />;
          }
          return (
            <ThemeContext.Provider
              value={{
                id: songId,
                spectrumFunction: props.spectrumFunctions[songId],
                ...song.themes,
              } as ThemeContextValue}
            >
              <SongContext.Provider
                value={{
                  id: songId,
                  ...song.audio,
                } as SongContextValue}
              >
                <InfoContext.Provider
                  value={{
                    id: songId,
                    ...song.info,
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
