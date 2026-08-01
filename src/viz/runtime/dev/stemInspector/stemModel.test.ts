import { describe, it, expect } from "vitest";
import { buildSidebarModel, type AppConfigSong } from "./stemModel";

const config: AppConfigSong[] = [
  {
    id: "moonrise",
    audio: {
      groups: [
        {
          name: "rhythm",
          analyser: { power: 7, smoothingTimeConstant: 0.3, split: true },
          voices: [{ name: "kick-snare[4]" }],
        },
      ],
    },
  },
];

describe("buildSidebarModel", () => {
  it("groups stems song → band using app-config voices, appending .wav", () => {
    const m = buildSidebarModel(config, [{ song: "moonrise", name: "kick-snare[4].wav" }]);
    expect(m.songs[0].song).toBe("moonrise");
    expect(m.songs[0].bands[0].band).toBe("rhythm");
    expect(m.songs[0].bands[0].stems[0]).toMatchObject({
      name: "kick-snare[4].wav",
      url: "/audio/wav/moonrise/kick-snare[4].wav",
    });
  });

  it("strips `split` from the analyser preset (the bake is mono)", () => {
    const m = buildSidebarModel(config, [{ song: "moonrise", name: "kick-snare[4].wav" }]);
    const preset = m.songs[0].bands[0].stems[0].analyser;
    expect(preset).toMatchObject({ power: 7, smoothingTimeConstant: 0.3 });
    expect("split" in preset).toBe(false);
  });

  it("puts on-disk stems not named in app-config under 'unassigned'", () => {
    const m = buildSidebarModel(config, [
      { song: "moonrise", name: "kick-snare[4].wav" },
      { song: "moonrise", name: "ambient-track.wav" },
    ]);
    const bands = m.songs[0].bands.map((b) => b.band);
    expect(bands).toEqual(["rhythm", "unassigned"]);
    expect(m.songs[0].bands[1].stems[0].analyser).toEqual({});
  });

  it("lists config voices missing from disk nowhere (disk is the source of existence)", () => {
    const m = buildSidebarModel(config, []);
    expect(m.songs).toEqual([]);
  });

  it("handles songs on disk that app-config does not know", () => {
    const m = buildSidebarModel(config, [{ song: "application", name: "click.wav" }]);
    expect(m.songs[0]).toMatchObject({ song: "application" });
    expect(m.songs[0].bands[0].band).toBe("unassigned");
  });
});
