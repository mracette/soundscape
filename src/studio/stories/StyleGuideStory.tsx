import {
  accents,
  textPrimary,
  textSecondary,
  radii,
  glowShadow,
  sSize,
  mSize,
  lSize,
  xlSize,
} from "../../styles/settings";
import * as styles from "./StyleGuideStory.css";

const ACCENT_NAMES = Object.keys(accents) as (keyof typeof accents)[];

const TYPE_RAMP = [
  { name: "sSize", size: sSize },
  { name: "mSize", size: mSize },
  { name: "lSize", size: lSize },
  { name: "xlSize", size: xlSize },
];

/** Renders the accent/text/radii/type-scale token sheet so the palette can be calibrated visually. */
export const StyleGuideStory = () => (
  <div className={styles.wrap}>
    <div>
      <div className={styles.sectionTitle}>Accents</div>
      <div className={styles.accentGrid}>
        {ACCENT_NAMES.map((name) => {
          const accent = accents[name];
          return (
            <div key={name} className={styles.accentCard}>
              <div className={styles.swatch} style={{ background: accent.base }} />
              <span className={styles.label}>
                {name} <span className={styles.sub}>{accent.base}</span>
              </span>
              <div
                className={styles.glowChip}
                style={{ boxShadow: glowShadow(accent.glow) }}
              />
              <div
                className={styles.gradientBar}
                style={{
                  background: `linear-gradient(90deg, ${accent.gradientFrom}, ${accent.gradientTo})`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>

    <div>
      <div className={styles.sectionTitle}>Text</div>
      <div className={styles.textSample}>
        <span className={styles.primaryText}>textPrimary — {textPrimary}</span>
        <span className={styles.secondaryText}>textSecondary — {textSecondary}</span>
      </div>
    </div>

    <div>
      <div className={styles.sectionTitle}>Radii</div>
      <div className={styles.radiiRow}>
        <div className={styles.radiiCard}>
          <div className={styles.pillSurface} />
          <span className={styles.label}>pill — {radii.pill}</span>
        </div>
        <div className={styles.radiiCard}>
          <div className={styles.panelSurface} />
          <span className={styles.label}>panel — {radii.panel}</span>
        </div>
        <div className={styles.radiiCard}>
          <div className={styles.controlSurface} />
          <span className={styles.label}>control — {radii.control}</span>
        </div>
      </div>
    </div>

    <div>
      <div className={styles.sectionTitle}>Type Ramp</div>
      <div className={styles.typeRamp}>
        {TYPE_RAMP.map(({ name, size }) => (
          <span key={name} style={{ fontSize: size }}>
            {name} — {size}
          </span>
        ))}
      </div>
    </div>
  </div>
);
