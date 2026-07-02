import { describe, it, expect, beforeEach, vi } from "vitest";
import { useMusicPlayerStore, VoiceState } from "./musicPlayerStore";

// The store is headless-testable: actions and state via getState(), no React.
const store = () => useMusicPlayerStore.getState();

/** Voice.ref is only ever `.click()`ed by background mode — a stub suffices. */
const makeVoice = (id: string, group: string, voiceState: VoiceState = "stopped") => ({
  id,
  group,
  voiceState,
  ref: {} as HTMLElement,
});

/**
 * Register `group`, then bring `ids` in one at a time the way ToggleButton
 * does: add the voice as pending-start, queue it, then mark it active.
 */
const bringIn = (group: string, maxPolyphony: number, ids: string[]) => {
  store().registerGroup(group, maxPolyphony);
  for (const id of ids) {
    store().addVoice(makeVoice(id, group, "pending-start"));
    store().queueVoice(group, id, "pending-start");
    store().updateVoiceState({ id, newState: "active" });
  }
};

describe("useMusicPlayerStore", () => {
  beforeEach(() => {
    store().reset();
  });

  describe("initial state", () => {
    it("starts with the documented defaults, including timeWarp 0 and energy 0.5", () => {
      const s = store();
      expect(s.voices).toEqual([]);
      expect(s.groups).toEqual({});
      expect(s.groupSolos).toEqual([]);
      expect(s.backgroundMode).toBe(false);
      expect(s.timeWarp).toBe(0);
      expect(s.energy).toBe(0.5);
      expect(s.pauseVisuals).toBe(false);
      expect(s.mute).toBe(false);
    });
  });

  describe("voice state transitions", () => {
    it("addVoice appends voices in call order", () => {
      store().addVoice(makeVoice("a", "g"));
      store().addVoice(makeVoice("b", "g"));
      expect(store().voices.map((v) => v.id)).toEqual(["a", "b"]);
    });

    it("updateVoiceState walks a voice through the full lifecycle", () => {
      store().addVoice(makeVoice("a", "g"));
      for (const state of ["pending-start", "active", "pending-stop", "stopped"] as const) {
        store().updateVoiceState({ id: "a", newState: state });
        expect(store().voices[0].voiceState).toBe(state);
      }
    });

    it("updating a voice does NOT move it to the end of the array", () => {
      // Order preservation matters: the viz reads `voices` positionally each frame.
      store().addVoice(makeVoice("a", "g"));
      store().addVoice(makeVoice("b", "g"));
      store().addVoice(makeVoice("c", "g"));
      store().updateVoiceState({ id: "b", newState: "active" });
      expect(store().voices.map((v) => v.id)).toEqual(["a", "b", "c"]);
      expect(store().voices[1].voiceState).toBe("active");
    });

    it("updateVoiceState with an unknown id changes nothing", () => {
      store().addVoice(makeVoice("a", "g", "active"));
      store().updateVoiceState({ id: "nope", newState: "stopped" });
      expect(store().voices).toEqual([makeVoice("a", "g", "active")]);
    });
  });

  describe("polyphony and eviction", () => {
    it("registerGroup starts a group with an empty order and no overrides", () => {
      store().registerGroup("g", 2);
      expect(store().groups.g).toEqual({
        maxPolyphony: 2,
        playerOrder: [],
        playerOverrides: [],
      });
    });

    it("appends voices in arrival order while under the cap", () => {
      bringIn("g", 3, ["a", "b", "c"]);
      expect(store().groups.g.playerOrder).toEqual(["a", "b", "c"]);
      expect(store().groups.g.playerOverrides).toEqual([]);
    });

    it("unlimited groups (maxPolyphony -1) never evict", () => {
      bringIn("g", -1, ["a", "b", "c", "d", "e"]);
      expect(store().groups.g.playerOrder).toEqual(["a", "b", "c", "d", "e"]);
      expect(store().groups.g.playerOverrides).toEqual([]);
    });

    it("in a poly=1 group, a second voice overrides the first", () => {
      bringIn("g", 1, ["a", "b"]);
      expect(store().groups.g.playerOrder).toEqual(["b"]);
      expect(store().groups.g.playerOverrides).toEqual(["a"]);
    });

    it("in a poly=N group, the oldest voice is evicted first", () => {
      bringIn("g", 2, ["a", "b", "c"]);
      expect(store().groups.g.playerOrder).toEqual(["b", "c"]);
      expect(store().groups.g.playerOverrides).toEqual(["a"]);
    });

    it("a later eviction replaces the override list rather than accumulating", () => {
      bringIn("g", 1, ["a", "b", "c"]);
      // b's override of a is discarded when c overrides b
      expect(store().groups.g.playerOrder).toEqual(["c"]);
      expect(store().groups.g.playerOverrides).toEqual(["b"]);
    });

    it("clearVoiceOverride removes the voice from the override list", () => {
      bringIn("g", 1, ["a", "b"]);
      store().clearVoiceOverride("g", "a");
      expect(store().groups.g.playerOverrides).toEqual([]);
    });

    it("queueVoice pending-stop removes the voice from the order without touching overrides", () => {
      bringIn("g", 2, ["a", "b"]);
      store().updateVoiceState({ id: "a", newState: "pending-stop" });
      store().queueVoice("g", "a", "pending-stop");
      expect(store().groups.g.playerOrder).toEqual(["b"]);
      expect(store().groups.g.playerOverrides).toEqual([]);
    });

    it("queueVoice on an unregistered group is a no-op", () => {
      store().queueVoice("ghost", "a", "pending-start");
      expect(store().groups).toEqual({});
    });
  });

  describe("solo and mute", () => {
    it("addGroupSolo replaces any existing solo (single-solo semantics)", () => {
      store().addGroupSolo("drums");
      store().addGroupSolo("keys");
      expect(store().groupSolos).toEqual(["keys"]);
    });

    it("removeGroupSolo clears the solo list", () => {
      store().addGroupSolo("drums");
      store().removeGroupSolo();
      expect(store().groupSolos).toEqual([]);
    });

    it("startMute and stopMute toggle the mute flag", () => {
      store().startMute();
      expect(store().mute).toBe(true);
      store().stopMute();
      expect(store().mute).toBe(false);
    });
  });

  describe("reset and randomize callback registries", () => {
    it("registers callbacks by name and invokes them", () => {
      const onReset = vi.fn();
      const onRandomize = vi.fn();
      store().addResetCallback({ name: "hats", callback: onReset });
      store().addRandomizeCallback({ name: "hats", callback: onRandomize });

      store().resetCallbacks.forEach((cb) => cb.callback());
      store().randomizeCallbacks.forEach((cb) => cb.callback());
      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onRandomize).toHaveBeenCalledTimes(1);
    });

    it("re-registering the same name replaces the callback and moves it to the end", () => {
      const stale = vi.fn();
      const fresh = vi.fn();
      store().addResetCallback({ name: "hats", callback: stale });
      store().addResetCallback({ name: "keys", callback: vi.fn() });
      store().addResetCallback({ name: "hats", callback: fresh });

      expect(store().resetCallbacks.map((cb) => cb.name)).toEqual(["keys", "hats"]);
      store().resetCallbacks.forEach((cb) => cb.callback());
      expect(stale).not.toHaveBeenCalled();
      expect(fresh).toHaveBeenCalledTimes(1);
    });
  });

  describe("background mode, time warp, and energy", () => {
    it("setBackgroundMode, setTimeWarp, setEnergy, and setPauseVisuals write their slices", () => {
      store().setBackgroundMode(true);
      store().setTimeWarp(0.4);
      store().setEnergy(0.08);
      store().setPauseVisuals(true);
      const s = store();
      expect(s.backgroundMode).toBe(true);
      expect(s.timeWarp).toBe(0.4);
      expect(s.energy).toBe(0.08);
      expect(s.pauseVisuals).toBe(true);
    });
  });

  describe("reset", () => {
    it("returns every data slice to its initial value", () => {
      bringIn("g", 1, ["a", "b"]);
      store().addGroupSolo("g");
      store().addResetCallback({ name: "x", callback: vi.fn() });
      store().setBackgroundMode(true);
      store().setTimeWarp(0.9);
      store().setEnergy(0.9);
      store().startMute();

      store().reset();

      const s = store();
      expect(s.voices).toEqual([]);
      expect(s.groups).toEqual({});
      expect(s.groupSolos).toEqual([]);
      expect(s.resetCallbacks).toEqual([]);
      expect(s.randomizeCallbacks).toEqual([]);
      expect(s.backgroundMode).toBe(false);
      expect(s.timeWarp).toBe(0);
      expect(s.energy).toBe(0.5);
      expect(s.mute).toBe(false);
    });
  });
});
