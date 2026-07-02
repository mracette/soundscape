/** Structural subset of a src/app-config.json entry the inspector needs. */
export interface AppConfigSong {
  id: string;
  audio: {
    groups: {
      name: string;
      analyser?: Record<string, unknown>;
      voices: { name: string }[];
    }[];
  };
}

export interface StemEntry {
  song: string;
  band: string;
  name: string;
  url: string;
  /** Band analyser preset from app-config ({} for unassigned stems). */
  analyser: Record<string, unknown>;
}

export interface SidebarModel {
  songs: { song: string; bands: { band: string; stems: StemEntry[] }[] }[];
}

/**
 * Merge app-config band definitions with the on-disk stem listing. Disk decides
 * which stems exist; app-config decides which band a stem belongs to and what
 * analyser preset it carries. `split` is dropped from presets — the inspector
 * analyses a mono mixdown, matching the Blender bake. Stems (or whole songs)
 * unknown to app-config land in an "unassigned" band with an empty preset.
 */
export function buildSidebarModel(
  appConfig: AppConfigSong[],
  files: { song: string; name: string }[]
): SidebarModel {
  const bandOf = new Map<string, { band: string; analyser: Record<string, unknown> }>();
  for (const song of appConfig) {
    for (const group of song.audio.groups) {
      const { split: _split, ...preset } = group.analyser ?? {};
      for (const voice of group.voices) {
        bandOf.set(`${song.id}/${voice.name}.wav`, { band: group.name, analyser: preset });
      }
    }
  }

  const songs = new Map<string, Map<string, StemEntry[]>>();
  for (const f of files) {
    const hit = bandOf.get(`${f.song}/${f.name}`);
    const band = hit?.band ?? "unassigned";
    const entry: StemEntry = {
      song: f.song,
      band,
      name: f.name,
      url: `/audio/wav/${f.song}/${f.name}`,
      analyser: hit?.analyser ?? {},
    };
    if (!songs.has(f.song)) songs.set(f.song, new Map());
    const bands = songs.get(f.song)!;
    if (!bands.has(band)) bands.set(band, []);
    bands.get(band)!.push(entry);
  }

  return {
    songs: [...songs.entries()].map(([song, bands]) => ({
      song,
      bands: [...bands.entries()]
        .sort(([a], [b]) => (a === "unassigned" ? 1 : b === "unassigned" ? -1 : 0))
        .map(([band, stems]) => ({ band, stems })),
    })),
  };
}
