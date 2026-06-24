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
  (): void;
}

interface RandomizeCallback {
  name: string;
  (): void;
}

interface MusicPlayerState {
  players: unknown[];
  voices: Voice[];
  groupSolos: string[];
  resetCallbacks: ResetCallback[];
  randomizeCallbacks: RandomizeCallback[];
  isLoading: boolean;
  backgroundMode: boolean;
  randomizeEffects: boolean;
  pauseVisuals: boolean;
  mute: boolean;
  soloOverride: boolean;
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
  players: [],
  voices: [],
  groupSolos: [],
  resetCallbacks: [],
  randomizeCallbacks: [],
  isLoading: true,
  backgroundMode: false,
  randomizeEffects: false,
  pauseVisuals: false,
  mute: false,
  soloOverride: false,
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
      voices: [
        ...s.voices.filter((v) => v.id !== id),
        { ...s.voices.find((v) => v.id === id)!, voiceState: newState },
      ],
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
