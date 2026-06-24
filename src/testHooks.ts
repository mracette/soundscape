import { useMusicPlayerStore } from "./stores/musicPlayerStore";
import type { WebAudioWrapper } from "./classes/WebAudioWrapper";

/**
 * Read-only test seam. Installed only under import.meta.env.DEV (see AppWrap),
 * so it is dead-code-eliminated from production builds. Lets e2e tests read
 * real store and WebAudio gain state that has no DOM reflection. Never mutates.
 */
export function installTestHooks(waw: WebAudioWrapper): void {
  (window as unknown as { __soundscape: unknown }).__soundscape = {
    store: () => useMusicPlayerStore.getState(),
    gain: (songId: string, groupName: string) =>
      waw.getEffects(songId).groupNodes[groupName].gain.value,
    premasterGain: () => waw.getEffects().premaster.gain.value,
  };
}
