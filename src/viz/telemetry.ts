export interface TelemetrySnapshot {
  cpuMs: number;
  gpuMs: number | null;
  budgetPct: number;
  gpuAvailable: boolean;
  samples: number;
}

const FRAME_BUDGET_MS = 1000 / 60;
const WINDOW = 60; // frames retained for the rolling median

// EXT_disjoint_timer_query (WebGL1) has no lib.dom types — declare the subset used.
interface DisjointTimerQueryExt {
  createQueryEXT(): WebGLQuery;
  beginQueryEXT(target: number, query: WebGLQuery): void;
  endQueryEXT(target: number): void;
  deleteQueryEXT(query: WebGLQuery): void;
  getQueryObjectEXT(query: WebGLQuery, pname: number): number;
  readonly TIME_ELAPSED_EXT: number;
  readonly GPU_DISJOINT_EXT: number;
  readonly QUERY_RESULT_EXT: number;
  readonly QUERY_RESULT_AVAILABLE_EXT: number;
}

/**
 * Per-frame compute telemetry. CPU time wraps the JS render() call; GPU time
 * uses the WebGL1 EXT_disjoint_timer_query extension (async — results arrive a
 * few frames later, polled here). GPU is best-effort: null when the extension
 * is absent (e.g. headless SwiftShader) or a disjoint event invalidates timing.
 */
export class FrameTelemetry {
  private gl: WebGLRenderingContext;
  private ext: DisjointTimerQueryExt | null;
  private cpu: number[] = [];
  private gpu: number[] = [];
  private t0 = 0;
  private active: WebGLQuery | null = null;
  private pending: WebGLQuery[] = [];

  constructor(gl: WebGLRenderingContext) {
    this.gl = gl;
    this.ext = gl.getExtension(
      "EXT_disjoint_timer_query"
    ) as DisjointTimerQueryExt | null;
  }

  beginFrame(): void {
    this.t0 = performance.now();
    if (this.ext && !this.active) {
      const e = this.ext;
      const q = e.createQueryEXT();
      e.beginQueryEXT(e.TIME_ELAPSED_EXT, q);
      this.active = q;
    }
  }

  endFrame(): void {
    this.record(this.cpu, performance.now() - this.t0);
    if (this.ext && this.active) {
      const e = this.ext;
      e.endQueryEXT(e.TIME_ELAPSED_EXT);
      this.pending.push(this.active);
      this.active = null;
    }
    this.pollGpu();
  }

  private pollGpu(): void {
    if (!this.ext) return;
    const e = this.ext;
    // A disjoint event means all in-flight timings are unreliable — discard them.
    if (this.gl.getParameter(e.GPU_DISJOINT_EXT)) {
      this.pending.forEach((q) => e.deleteQueryEXT(q));
      this.pending = [];
      return;
    }
    const still: WebGLQuery[] = [];
    for (const q of this.pending) {
      if (e.getQueryObjectEXT(q, e.QUERY_RESULT_AVAILABLE_EXT)) {
        const ns = e.getQueryObjectEXT(q, e.QUERY_RESULT_EXT) as number;
        this.record(this.gpu, ns / 1e6);
        e.deleteQueryEXT(q);
      } else {
        still.push(q);
      }
    }
    this.pending = still;
  }

  private record(buf: number[], v: number): void {
    buf.push(v);
    if (buf.length > WINDOW) buf.shift();
  }

  private median(buf: number[]): number {
    if (buf.length === 0) return 0;
    const s = [...buf].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  }

  snapshot(): TelemetrySnapshot {
    const cpuMs = this.median(this.cpu);
    const gpuAvailable = this.gpu.length > 0;
    const gpuMs = gpuAvailable ? this.median(this.gpu) : null;
    return {
      cpuMs,
      gpuMs,
      gpuAvailable,
      budgetPct: ((cpuMs + (gpuMs ?? 0)) / FRAME_BUDGET_MS) * 100,
      samples: this.cpu.length,
    };
  }
}
