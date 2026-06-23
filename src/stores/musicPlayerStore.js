import { create } from "zustand";

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

export const useMusicPlayerStore = create((set) => ({
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
        { ...s.voices.find((v) => v.id === id), voiceState: newState },
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
