/**
 * Cross-component state hub for the music player.
 *
 * `voices` is the source of truth for which sounds are active — the viz reads
 * it each frame and background mode iterates it to toggle voices on/off.
 * `Voice.ref` is the toggle button's DOM node; background mode calls `.click()`
 * on it programmatically rather than dispatching audio events directly.
 *
 * `resetCallbacks` / `randomizeCallbacks` are registries: each instrument
 * component registers itself by name on mount so the global Reset/Randomize
 * buttons can reach every component without prop drilling.
 */
import { create } from "zustand";

type VoiceState = "stopped" | "pending-start" | "active" | "pending-stop";

interface Voice {
  id: string;
  group: string;
  voiceState: VoiceState;
  ref: HTMLElement;
}

interface ResetCallback {
  name: string;
  resetCallback: () => void;
}

interface RandomizeCallback {
  name: string;
  randomizeCallback: () => void;
}

interface MusicPlayerState {
  voices: Voice[];
  groupSolos: string[];
  resetCallbacks: ResetCallback[];
  randomizeCallbacks: RandomizeCallback[];
  isLoading: boolean;
  backgroundMode: boolean;
  pauseVisuals: boolean;
  mute: boolean;
  setBackgroundMode: (v: boolean) => void;
  setPauseVisuals: (v: boolean) => void;
  startMute: () => void;
  stopMute: () => void;
  addVoice: (voice: Voice) => void;
  updateVoiceState: (args: { id: string; newState: VoiceState }) => void;
  addGroupSolo: (name: string) => void;
  removeGroupSolo: () => void;
  addResetCallback: (cb: ResetCallback) => void;
  addRandomizeCallback: (cb: RandomizeCallback) => void;
  reset: () => void;
}

const initialState = {
  voices: [],
  groupSolos: [],
  resetCallbacks: [],
  randomizeCallbacks: [],
  isLoading: true,
  backgroundMode: false,
  pauseVisuals: false,
  mute: false,
};

export const useMusicPlayerStore = create<MusicPlayerState>()((set) => ({
  ...initialState,
  setBackgroundMode: (v) => set({ backgroundMode: v }),
  setPauseVisuals: (v) => set({ pauseVisuals: v }),
  startMute: () => set({ mute: true }),
  stopMute: () => set({ mute: false }),
  addVoice: (voice) => set((s) => ({ voices: [...s.voices, voice] })),
  updateVoiceState: ({ id, newState }) =>
    set((s) => ({
      voices: s.voices.map((v) =>
        v.id === id ? { ...v, voiceState: newState } : v
      ),
    })),
  addGroupSolo: (name) => set({ groupSolos: [name] }),
  removeGroupSolo: () => set({ groupSolos: [] }),
  addResetCallback: (cb) =>
    set((s) => ({
      resetCallbacks: [
        ...s.resetCallbacks.filter((o) => o.name !== cb.name),
        cb,
      ],
    })),
  addRandomizeCallback: (cb) =>
    set((s) => ({
      randomizeCallbacks: [
        ...s.randomizeCallbacks.filter((o) => o.name !== cb.name),
        cb,
      ],
    })),
  reset: () => set(initialState),
}));
