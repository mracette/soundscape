import {
  landingPageWordmark,
  landingPageWordmarkStage,
} from "../styles/components/LandingPage.css";
import { WordmarkParticles } from "./WordmarkParticles";

/**
 * The SOUNDSCAPE wordmark: a rune alphabet whose sixth letter is the tall
 * sigil at the centre of the word, standing in for the second S.
 *
 * Painted as crystal rather than drawn, so it ships as an image. It is applied
 * as a CSS mask over `currentColor` rather than as an <img>: the artwork is
 * monochrome, so a single greyscale channel carries all of it — a third the
 * bytes of the equivalent RGBA file, and the colour stays under CSS control.
 * The facet shading and the bloom are baked into that mask, which is why the
 * mark needs no glow filter. See `docs/wordmark/` for the pipeline behind it.
 */
export const SoundscapeWordmark = () => (
  <div className={landingPageWordmarkStage}>
    <WordmarkParticles />
    <div className={landingPageWordmark} role="img" aria-label="Soundscape" />
  </div>
);
