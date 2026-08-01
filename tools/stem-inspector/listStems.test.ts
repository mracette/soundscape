import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { listStemFiles } from "./listStems";

describe("listStemFiles", () => {
  let root: string;
  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), "stems-"));
  });
  afterEach(() => rmSync(root, { recursive: true, force: true }));

  it("lists wav files grouped by song directory", () => {
    mkdirSync(join(root, "moonrise"));
    writeFileSync(join(root, "moonrise", "kick-snare[4].wav"), "");
    writeFileSync(join(root, "moonrise", "notes.txt"), "");
    mkdirSync(join(root, "swamp"));
    writeFileSync(join(root, "swamp", "sub[8].wav"), "");
    expect(listStemFiles(root)).toEqual([
      { song: "moonrise", name: "kick-snare[4].wav" },
      { song: "swamp", name: "sub[8].wav" },
    ]);
  });

  it("returns [] for a missing root (worktree without the audio symlink)", () => {
    expect(listStemFiles(join(root, "nope"))).toEqual([]);
  });

  it("ignores stray files at the root level", () => {
    writeFileSync(join(root, "loose.wav"), "");
    expect(listStemFiles(root)).toEqual([]);
  });
});
