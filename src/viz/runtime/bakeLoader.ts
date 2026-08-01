import type { BakeResult } from "./bake/bakeSignal";

/** Fetch a song's committed per-stem bakes; missing files warn and are omitted
 *  (the runtime reads 0 for their bands — same rule as unknown bands). */
export async function loadSongBakes(
  baseUrl: string,
  songId: string,
  voiceNames: string[],
  fetchImpl: typeof fetch = fetch
): Promise<Record<string, BakeResult>> {
  const out: Record<string, BakeResult> = {};
  await Promise.all(
    voiceNames.map(async (name) => {
      const url = `${baseUrl}bakes/${songId}/${name}.json`;
      try {
        const res = await fetchImpl(url);
        if (!res.ok) {
          console.warn(`bake missing for "${name}" (${res.status} ${url}); band will read 0 for it`);
          return;
        }
        const json = (await res.json()) as BakeResult;
        // a 200 with the wrong shape (truncated bake, CDN error envelope)
        // must be omitted like a missing file, not crash the render loop
        if (!Array.isArray(json.frames)) {
          console.warn(`bake malformed for "${name}" (${url}); band will read 0 for it`);
          return;
        }
        out[name] = json;
      } catch (err) {
        console.warn(`bake fetch failed for "${name}" (${url}):`, err);
      }
    })
  );
  return out;
}

const STALE_TOLERANCE_SEC = 0.05;

/** Loud dev hint for the edited-the-stem-forgot-to-rebake trap. */
export function warnIfStale(bake: BakeResult, bufferDurationSec: number | null, voice: string): void {
  if (bufferDurationSec === null) return;
  if (Math.abs(bake.durationSec - bufferDurationSec) > STALE_TOLERANCE_SEC) {
    console.warn(
      `bake for "${voice}" is ${bake.durationSec.toFixed(3)}s but the audio buffer is ` +
        `${bufferDurationSec.toFixed(3)}s — re-run \`pnpm bake:song\`.`
    );
  }
}
