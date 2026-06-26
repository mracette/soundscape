import { gsap } from "gsap";
import { useMusicPlayerStore } from "./stores/musicPlayerStore";
import type { WebAudioWrapper } from "./classes/WebAudioWrapper";

/**
 * Read-only test seam. Installed only under import.meta.env.DEV (see AppWrap),
 * so it is dead-code-eliminated from production builds. Lets e2e/perf tools read
 * real state that has no DOM reflection. Never mutates.
 */
export function installTestHooks(waw: WebAudioWrapper): void {
  (window as unknown as { __soundscape: unknown }).__soundscape = {
    store: () => useMusicPlayerStore.getState(),
    gain: (songId: string, groupName: string) =>
      waw.getEffects(songId).groupNodes[groupName].gain.value,
    premasterGain: () => waw.getEffects().premaster.gain.value,
    // Leak signals: live GSAP tweens + pending scheduler events. Stable counts
    // across a long toggle session = no leak; monotonic growth = a leak.
    gsapTweens: () => gsap.globalTimeline.getChildren(true, true, false).length,
    schedulerQueue: () => waw.scheduler.queue.length,
  };
}
