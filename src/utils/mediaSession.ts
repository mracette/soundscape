/**
 * Publishes Now Playing metadata and lock-screen transport controls via the
 * Media Session API. Without this, iOS labels background audio with the page
 * origin ("localhost" in the native shell) and the lock-screen transport
 * buttons do nothing. No-op where the API is unsupported.
 */

interface TransportHandlers {
  onPlay: () => void;
  onPause: () => void;
}

export const publishNowPlaying = (
  title: string,
  handlers: TransportHandlers
): void => {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title,
    artist: "Soundscape",
  });
  navigator.mediaSession.playbackState = "playing";
  navigator.mediaSession.setActionHandler("play", handlers.onPlay);
  navigator.mediaSession.setActionHandler("pause", handlers.onPause);
};

export const setNowPlayingState = (state: "playing" | "paused"): void => {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.playbackState = state;
};

export const clearNowPlaying = (): void => {
  if (!("mediaSession" in navigator)) return;
  navigator.mediaSession.metadata = null;
  navigator.mediaSession.playbackState = "none";
  navigator.mediaSession.setActionHandler("play", null);
  navigator.mediaSession.setActionHandler("pause", null);
};
