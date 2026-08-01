/**
 * Downsample PCM to one {min,max} pair per canvas column — the standard
 * waveform-rendering reduction. Columns beyond the sample range are {0,0} so
 * the caller can always draw exactly `columns` verticals.
 */
export function peakColumns(samples: Float32Array, columns: number): { min: number; max: number }[] {
  const out: { min: number; max: number }[] = [];
  const chunk = samples.length / columns;
  for (let c = 0; c < columns; c++) {
    const lo = Math.ceil(c * chunk);
    const hi = Math.min(samples.length, Math.ceil((c + 1) * chunk));
    let min = 0;
    let max = 0;
    if (lo < hi) {
      for (let i = lo; i < hi; i++) {
        if (samples[i] < min) min = samples[i];
        if (samples[i] > max) max = samples[i];
      }
    }
    out.push({ min, max });
  }
  return out;
}
