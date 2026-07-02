/**
 * Minimal AudioBufferSourceNode transport. Sources are one-shot in Web Audio,
 * so play/seek rebuild the source; position derives from ctx.currentTime.
 */
export class StemPlayer {
  private ctx = new AudioContext();
  private buffer: AudioBuffer | null = null;
  private source: AudioBufferSourceNode | null = null;
  private startedAt = 0;
  private offset = 0;
  private loop = false;
  private isPlaying = false;

  load(buf: AudioBuffer): void {
    this.stop();
    this.buffer = buf;
    this.offset = 0;
  }

  private start(): void {
    if (!this.buffer) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffer;
    src.loop = this.loop;
    src.connect(this.ctx.destination);
    src.onended = () => {
      if (this.source === src && !this.loop) {
        this.isPlaying = false;
        this.offset = 0;
      }
    };
    src.start(0, this.offset);
    this.source = src;
    this.startedAt = this.ctx.currentTime;
    this.isPlaying = true;
    void this.ctx.resume();
  }

  private stop(): void {
    if (this.source) {
      this.source.onended = null;
      this.source.stop();
      this.source = null;
    }
    this.isPlaying = false;
  }

  toggle(): void {
    if (this.isPlaying) {
      this.offset = this.position;
      this.stop();
    } else {
      this.start();
    }
  }

  seek(sec: number): void {
    const wasPlaying = this.isPlaying;
    this.stop();
    this.offset = sec;
    if (wasPlaying) this.start();
  }

  setLoop(on: boolean): void {
    this.loop = on;
    if (this.source) this.source.loop = on;
  }

  get playing(): boolean {
    return this.isPlaying;
  }

  get position(): number {
    if (!this.buffer) return 0;
    if (!this.isPlaying) return this.offset;
    const raw = this.offset + (this.ctx.currentTime - this.startedAt);
    return this.loop ? raw % this.buffer.duration : Math.min(raw, this.buffer.duration);
  }
}
