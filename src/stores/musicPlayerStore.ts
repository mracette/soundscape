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

export type VoiceState = "stopped" | "pending-start" | "active" | "pending-stop";

interface Voice {
  id: string;
  group: string;
  voiceState: VoiceState;
  ref: HTMLElement;
}

interface GroupState {
  maxPolyphony: number;
  playerOrder: string[];
  playerOverrides: string[];
}

interface NamedCallback {
  name: string;
  callback: () => void;
}

interface MusicPlayerState {
  voices: Voice[];
  groups: Record<string, GroupState>;
  groupSolos: string[];
  resetCallbacks: NamedCallback[];
  randomizeCallbacks: NamedCallback[];
  backgroundMode: boolean;
  pauseVisuals: boolean;
  mute: boolean;
  setBackgroundMode: (v: boolean) => void;
  setPauseVisuals: (v: boolean) => void;
  startMute: () => void;
  stopMute: () => void;
  registerGroup: (name: string, maxPolyphony: number) => void;
  queueVoice: (group: string, voiceId: string, newState: VoiceState) => void;
  clearVoiceOverride: (group: string, voiceId: string) => void;
  addVoice: (voice: Voice) => void;
  updateVoiceState: (args: { id: string; newState: VoiceState }) => void;
  addGroupSolo: (name: string) => void;
  removeGroupSolo: () => void;
  addResetCallback: (cb: NamedCallback) => void;
  addRandomizeCallback: (cb: NamedCallback) => void;
  reset: () => void;
}

const upsertByName = (
  list: NamedCallback[],
  cb: NamedCallback
): NamedCallback[] => [...list.filter((o) => o.name !== cb.name), cb];

const initialState = {
  voices: [],
  groups: {},
  groupSolos: [],
  resetCallbacks: [],
  randomizeCallbacks: [],
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
  registerGroup: (name, maxPolyphony) =>
    set((s) => ({
      groups: {
        ...s.groups,
        [name]: { maxPolyphony, playerOrder: [], playerOverrides: [] },
      },
    })),
  queueVoice: (group, voiceId, newState) =>
    set((s) => {
      const g = s.groups[group];
      if (!g) return {};
      // polyphony = group voices already turning on or on (voices was updated first)
      const polyphony = s.voices.filter(
        (v) =>
          v.group === group &&
          (v.voiceState === "pending-start" || v.voiceState === "active")
      ).length;
      let { playerOrder, playerOverrides } = g;
      if (newState === "pending-start") {
        if (g.maxPolyphony === -1 || polyphony <= g.maxPolyphony) {
          playerOrder = [...playerOrder, voiceId];
        } else {
          // over the cap: override the oldest, append the new one
          playerOverrides = [playerOrder[0]];
          playerOrder = [...playerOrder.slice(1), voiceId];
        }
      } else if (newState === "pending-stop") {
        playerOrder = playerOrder.filter((p) => p !== voiceId);
      }
      return {
        groups: { ...s.groups, [group]: { ...g, playerOrder, playerOverrides } },
      };
    }),
  clearVoiceOverride: (group, voiceId) =>
    set((s) => {
      const g = s.groups[group];
      if (!g) return {};
      return {
        groups: {
          ...s.groups,
          [group]: {
            ...g,
            playerOverrides: g.playerOverrides.filter((p) => p !== voiceId),
          },
        },
      };
    }),
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
    set((s) => ({ resetCallbacks: upsertByName(s.resetCallbacks, cb) })),
  addRandomizeCallback: (cb) =>
    set((s) => ({ randomizeCallbacks: upsertByName(s.randomizeCallbacks, cb) })),
  reset: () => set(initialState),
}));
