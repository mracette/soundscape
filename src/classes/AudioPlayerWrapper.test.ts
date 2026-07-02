import { describe, it, expect, beforeEach, vi } from "vitest";
import { AudioPlayerWrapper } from "./AudioPlayerWrapper";
import { createAudioPlayer } from "../utils/audioUtils";

vi.mock("../utils/audioUtils", () => ({
  createAudioPlayer: vi.fn(),
}));

/**
 * Fake AudioBufferSourceNode with the spec behaviors these tests hinge on:
 * `start()` throws only on reuse (never for being disconnected), `stop()`
 * throws when never started.
 */
class FakeVoiceSource {
  buffer = { duration: 2 };
  loop = false;
  loopStart = 0;
  loopEnd = 0;
  playbackRate = { value: 1 };
  connected = false;
  started: Array<{ when: number; offset: number | undefined }> = [];

  connect(): void {
    this.connected = true;
  }

  disconnect(): void {
    this.connected = false;
  }

  start(when: number, offset?: number): void {
    if (this.started.length > 0) throw new Error("InvalidStateError");
    this.started.push({ when, offset });
  }

  stop(): void {
    if (this.started.length === 0) throw new Error("InvalidStateError");
  }
}

class FakeContext {
  destination = {};
  sources: FakeVoiceSource[] = [];

  createBufferSource(): FakeVoiceSource {
    const source = new FakeVoiceSource();
    this.sources.push(source);
    return source;
  }
}

async function makePlayer() {
  const ctx = new FakeContext();
  const initial = new FakeVoiceSource();
  vi.mocked(createAudioPlayer).mockResolvedValue(
    initial as unknown as AudioBufferSourceNode
  );
  const player = new AudioPlayerWrapper(
    ctx as unknown as AudioContext,
    "path/to/audio.mp3",
    { destination: ctx.destination as AudioNode }
  );
  await player.init();
  return { ctx, player, initial };
}

describe("AudioPlayerWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts the initialized source directly on first play", async () => {
    const { player, initial } = await makePlayer();
    player.start(1);
    expect(initial.started).toMatchObject([{ when: 1 }]);
    expect(initial.connected).toBe(true);
  });

  it("reloads a used source before restarting (reuse throws by spec)", async () => {
    const { ctx, player, initial } = await makePlayer();
    player.start(1);
    player.stop();
    player.start(5);
    expect(ctx.sources).toHaveLength(1);
    const reloaded = ctx.sources[0];
    expect(reloaded).not.toBe(initial);
    expect(reloaded.started).toMatchObject([{ when: 5 }]);
    expect(reloaded.connected).toBe(true);
  });

  it("reloads a pristine-but-disconnected source instead of starting it silently", async () => {
    // song revisit: unmount cleanup stop()s (throws internally, swallowed) and
    // disconnect()s a voice that never played; the singleton returns the same
    // wrapper on the next visit
    const { ctx, player, initial } = await makePlayer();
    player.stop();
    player.disconnect();
    expect(initial.connected).toBe(false);

    player.start(3);
    const reloaded = ctx.sources[0];
    expect(reloaded).not.toBe(initial);
    expect(reloaded.connected).toBe(true);
    expect(reloaded.started).toMatchObject([{ when: 3 }]);
    // the severed pristine node was never started (that would be inaudible)
    expect(initial.started).toHaveLength(0);
  });

  it("seeds the recorded playback rate onto the source at start", async () => {
    const { player, initial } = await makePlayer();
    player.setPlaybackRate(0.575, 0);
    player.start(1);
    expect(initial.playbackRate.value).toBe(0.575);
  });
});
