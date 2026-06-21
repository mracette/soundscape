# Manual Verification Checklist

Run this after every modernization phase, before merging. The automated smoke
test (`npm run test:e2e`) covers boot/render/no-crash; this covers what it cannot:
audio, ambient motion, audio-reactive visuals, and responsive layout.

> If `/play/*` scenes need CloudFront assets locally, run the app / tests with
> `REACT_APP_ASSET_LOCATION=cloudfront`.

## Landing (`/`)
- [ ] Particle background renders and animates (ambient motion).
- [ ] "Soundscape" title and subtitle render.
- [ ] Song icons (swamp, mornings, moonrise, coming-soon) render and animate on hover.
- [ ] Clicking each song icon navigates to `/play/<song>`.
- [ ] The `/info` link opens the info view; closing returns to `/`.

## Each scene — swamp, mornings, moonrise (`/play/<song>`)
- [ ] Loading screen appears, then disappears once the scene loads.
- [ ] Scene visuals render correctly and match the previous phase (ambient animation present).
- [ ] Voice toggle buttons trigger their voices; triggered voices start **quantized to the grid** (not instantly).
- [ ] BPM / metronome timing sounds correct; multiple voices stay in sync.
- [ ] Mute toggles all audio; solo isolates a group.
- [ ] Effects panel: background mode and pause-visuals toggles behave as before.
- [ ] Visuals visibly react to the music.
- [ ] "Home" navigation returns to the landing page.

## Info (`/info`)
- [ ] Info content renders and is readable.

## Responsive
- [ ] Mobile viewport shows the mobile landing layout and song links.
- [ ] Resizing the window does not break the canvas or layout.
