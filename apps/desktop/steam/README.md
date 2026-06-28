# SteamPipe Upload Runbook

These are the USER ACTIONS required to ship Soundscape on Steam. None of them are automated — each requires decisions (pricing, age rating, store page copy) that only you can make.

## Prerequisites

1. **Register on Steamworks** — pay the $100 Steam Direct fee at <https://partner.steamgames.com/>. You receive an App ID and at least one Depot ID after approval.
2. **Install SteamCMD** — <https://developer.valvesoftware.com/wiki/SteamCMD>. No Steam client required on the build machine.

## One-time setup

1. Replace `YOUR_APP_ID` and `YOUR_DEPOT_ID` in `apps/desktop/steam/app_build.vdf` with the real values from your Steamworks App Admin page.
2. Set `STEAM_APP_ID` to the same app id in your environment (or CI secrets) so the in-app Steam overlay uses the correct id at runtime:
   ```
   export STEAM_APP_ID=<your_app_id>
   ```
3. Add the `steamworks.js` native module to `asarUnpack` in `apps/desktop/electron-builder.yml` so Electron can load it at runtime:
   ```yaml
   asarUnpack:
     - "node_modules/steamworks.js/dist/**"
   ```

## Build per-OS artifacts

Run the Task 6 build script for each target platform (see `apps/desktop/scripts/`):

| Platform     | Artifact                    | Notes                          |
|--------------|-----------------------------|--------------------------------|
| macOS        | `.dmg`                      | Sign + notarise before upload  |
| Windows      | `.exe` (NSIS installer)     | Code-sign before upload        |
| Linux x86-64 | `.AppImage`                 | Steam Deck depot               |

Output lands in `apps/desktop/dist/`.

## Upload with SteamCMD

```bash
steamcmd \
  +login <your_steam_username> \
  +run_app_build ../steam/app_build.vdf \
  +quit
```

Run this from inside `apps/desktop/`. SteamCMD will prompt for your password (and Steam Guard code if enabled). Build output is written to `apps/desktop/dist/steam-output/`.

## Steam Deck (Linux AppImage)

Create a separate depot for the Linux AppImage and map it to the Steam Deck hardware survey. In Steamworks App Admin → Depots, set the depot OS to Linux. Point `app_build.vdf` at the Linux artifact directory for that depot.

## After upload

- Set the build live in Steamworks App Admin → Builds (choose a branch, e.g. `default`).
- Fill in the store page: description, screenshots, trailer, age rating, tags.
- Submit for Valve review (typically 3–5 business days for new apps).
