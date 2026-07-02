import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Walk <rootDir>/<song>/*.wav (one level deep, matching public/audio/wav's
 * layout) into a flat, sorted stem list for the /__stems dev endpoint.
 * A missing rootDir returns [] — in git worktrees public/audio is a symlink
 * that may not exist (see tools/worktree-dev.sh).
 */
export function listStemFiles(rootDir: string): { song: string; name: string }[] {
  if (!existsSync(rootDir)) return [];
  const out: { song: string; name: string }[] = [];
  for (const song of readdirSync(rootDir).sort()) {
    const dir = join(rootDir, song);
    if (!statSync(dir).isDirectory()) continue;
    for (const name of readdirSync(dir).sort()) {
      if (name.endsWith(".wav")) out.push({ song, name });
    }
  }
  return out;
}
