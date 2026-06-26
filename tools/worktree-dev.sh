#!/usr/bin/env bash
#
# Spin up an isolated dev worktree with a live dev server on its own port —
# so you can run/profile the app without colliding with your main checkout.
#
# It handles the two things a fresh worktree is missing for this app:
#   1. node_modules  -> `pnpm install` (fast; hardlinked from the pnpm store)
#   2. gitignored runtime assets (public/audio, public/models, public/fonts)
#      and .env.local -> symlinked/copied from the source checkout, because
#      those large binaries are NOT in git and the scenes can't load without them.
#
# Usage:
#   tools/worktree-dev.sh <branch> [base-branch] [port]
#     branch       new branch + worktree name (worktree dir is a sibling: <repo>-<branch>)
#     base-branch  branch to fork from           (default: current branch)
#     port         vite dev server port          (default: 3100)
#
# Re-running with an existing worktree just refreshes the asset links and
# (re)starts the dev server.
set -euo pipefail

branch="${1:?usage: tools/worktree-dev.sh <branch> [base-branch] [port]}"
base="${2:-$(git branch --show-current)}"
port="${3:-3100}"

src_root="$(git rev-parse --show-toplevel)"
wt_path="${src_root}-${branch}"

# 1. Create the worktree (off base) if it doesn't exist yet.
if ! git -C "$src_root" worktree list --porcelain | grep -qx "worktree ${wt_path}"; then
  git -C "$src_root" worktree add "$wt_path" -b "$branch" "$base"
fi

cd "$wt_path"

# 2. Dependencies (store-backed, near-instant when the store is warm).
pnpm install --frozen-lockfile

# 3. Gitignored runtime assets — symlink the big binaries, copy small env files.
for d in audio models fonts; do
  if [ -e "$src_root/public/$d" ]; then
    rm -rf "$wt_path/public/$d"
    ln -s "$src_root/public/$d" "$wt_path/public/$d"
  fi
done
[ -f "$src_root/.env.local" ] && cp "$src_root/.env.local" "$wt_path/.env.local"

echo
echo "Worktree:  $wt_path  (branch '$branch' off '$base')"
echo "Assets:    public/{audio,models} symlinked from the main checkout"
echo "Dev server: http://localhost:${port}/"
echo

# 4. Start the dev server on its own port (strict, so a clash is obvious).
exec pnpm exec vite --port "$port" --strictPort
