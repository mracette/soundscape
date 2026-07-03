import {
  hotPink,
  hotGreen,
  hotBlue,
  moonYellow,
  whiteGlow,
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

const ACCENTS = [
  { name: "hotPink", value: hotPink },
  { name: "hotGreen", value: hotGreen },
  { name: "hotBlue", value: hotBlue },
  { name: "moonYellow", value: moonYellow },
];

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
        {ACCENTS.map(({ name, value }) => (
          <div key={name} className={styles.accentCard}>
            <div className={styles.swatch} style={{ background: value }} />
            <span className={styles.label}>
              {name} <span className={styles.sub}>{value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>

    <div>
      <div className={styles.sectionTitle}>Interactive Glow (always white)</div>
      <div
        className={styles.glowChip}
        style={{ boxShadow: glowShadow(whiteGlow) }}
      />
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
