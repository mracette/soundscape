import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { ThemeContext, ThemeContextValue, SongContextValue, InfoContextValue, AppConfigEntry, SongId } from "../contexts/contexts";
import { SongContext } from "../contexts/contexts";
import { InfoContext } from "../contexts/contexts";
import { MusicPlayer } from "./MusicPlayer";
import { LandingPage } from "./LandingPage";

const Studio = import.meta.env.DEV
  ? lazy(() => import("../studio/Studio").then((m) => ({ default: m.Studio })))
  : null;

interface Props {
  appConfig: AppConfigEntry[];
  spectrumFunctions: Record<string, (n: number) => string>;
}

export const AppRouter = (props: Props) => {
  return (
    <Switch>
      <Route path="/play/:songId">
        {(params) => {
          const songId = params.songId as SongId;
          const song = props.appConfig.find((s) => s.id === songId);
          if (!song) {
            return <Redirect to="/" replace />;
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
      {Studio && (
        <Route path="/studio/:storyId">
          {(params) => (
            <Suspense fallback={null}>
              <Studio storyId={params.storyId} />
            </Suspense>
          )}
        </Route>
      )}
      {Studio && (
        <Route path="/studio">
          <Suspense fallback={null}>
            <Studio />
          </Suspense>
        </Route>
      )}
      <Route>
        <LandingPage spectrumFunction={props.spectrumFunctions.stars} />
      </Route>
    </Switch>
  );
};
