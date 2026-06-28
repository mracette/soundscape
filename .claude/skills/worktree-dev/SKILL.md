---
name: worktree-dev
description: Use BEFORE creating a git worktree to run, profile, or visually verify the Soundscape app. Run tools/worktree-dev.sh instead of a plain `git worktree add` — a bare worktree has no node_modules and is missing the gitignored runtime assets (public/audio, public/models, public/fonts) and .env.local, so scenes fail to load with EncodingError. The script installs deps, symlinks those assets from the main checkout, and starts a dev server on its own port.
---

# Worktree dev server

When you need an **isolated checkout to run, profile, or visually verify the app**
(not just edit code), spin it up with the project script rather than rolling your
own worktree:

```bash
tools/worktree-dev.sh <branch> [base-branch] [port]
#   branch       new branch + worktree (sibling dir: <repo>-<branch>)
#   base-branch  branch to fork from   (default: current branch)
#   port         vite dev port         (default: 3100)
```

Run it from the main checkout. Re-running on an existing worktree just refreshes
the asset links and restarts the dev server.

## Why not a plain `git worktree add`

A fresh worktree is missing two things this app needs to run:

- **node_modules** — the script runs `pnpm install --frozen-lockfile` (fast;
  hardlinked from the pnpm store).
- **Gitignored runtime assets** — `public/{audio,models,fonts}` and `.env.local`
  are large binaries / secrets kept out of git. The script symlinks the assets
  and copies `.env.local` from the source checkout. Without them the scenes throw
  `EncodingError` and won't load.

## When you don't need it

Pure code edits, reviews, or test runs don't need a running app — a normal
worktree is fine. Reach for this script specifically when the worktree has to
*serve the app* on its own port.
