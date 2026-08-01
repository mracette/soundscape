/**
 * The whitelisted object properties a binding may drive. Kept as a const tuple
 * so the schema-sync test can compare it against the JSON Schema enum. Scalar
 * numeric targets only in v1 (color/uniform targets are deferred).
 */
export const TARGET_PROPERTIES = [
  "emissiveIntensity",
  "opacity",
  "scale",
  "scale.x",
  "scale.y",
  "scale.z",
  "rotation.x",
  "rotation.y",
  "rotation.z",
  "position.x",
  "position.y",
  "position.z",
] as const;

export type TargetProperty = (typeof TARGET_PROPERTIES)[number];

export const MEASURE_VALUES = ["volume", "bucket", "onset"] as const;
export type Measure = (typeof MEASURE_VALUES)[number];

export interface Source {
  band: string;
  measure: Measure;
  /** Required when `measure` is "bucket"; the analyser frequency bucket index. */
  bucket?: number;
}

export interface Smoothing {
  /** Rise responsiveness, 0..1. */
  attack: number;
  /** Fall responsiveness, 0..1. */
  release: number;
}

export interface Transform {
  /**
   * Noise-floor gate applied before smoothing: signal ≤ gate maps to exactly
   * 0 and the surviving range rescales to 0..1 (`max(0, s-gate)/(1-gate)`).
   * 0 ≤ gate < 1, default 0 (off).
   */
  gate?: number;
  /** signal ^ exponent before easing; > 0, default 1. */
  exponent?: number;
  /** d3-ease function name applied after the exponent; resolved at runtime. */
  ease?: string;
  smoothing?: Smoothing;
  /** Output value when the (shaped) signal is 0. */
  outMin: number;
  /** Output value when the (shaped) signal is 1. */
  outMax: number;
}

export interface Binding {
  target: { property: TargetProperty };
  source: Source;
  transform: Transform;
}

/** The shape stored at `object.userData.soundscape` and exported via glTF extras. */
export interface SoundscapeUserData {
  bindings: Binding[];
}
