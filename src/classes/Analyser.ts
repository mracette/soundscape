import * as d3 from "d3-ease";

interface AnalyserParams {
  id?: string | null;
  power?: number;
  gainBoost?: number;
  minDecibels?: number;
  maxDecibels?: number;
  minFrequency?: number;
  maxFrequency?: number;
  smoothingTimeConstant?: number;
  numBuckets?: number;
  split?: boolean;
  xEasing?: string | ((n: number) => number) | undefined;
  yEasing?: string | ((n: number) => number) | undefined;
  xExponent?: number;
  yExponent?: number;
  binMethod?: string;
  [key: string]: unknown;
}

// split analyser holds left/right AnalyserNode pair; non-split holds a single AnalyserNode
type SplitAnalyser = { left: AnalyserNode; right: AnalyserNode };

// split fft/time data holds left/right Uint8Arrays; non-split holds a single Uint8Array
type SplitUint8 = { left: Uint8Array<ArrayBuffer>; right: Uint8Array<ArrayBuffer> };
type FftData = Uint8Array<ArrayBuffer> | SplitUint8;

export class Analyser {
  input: AudioNode;
  context: AudioContext;
  // Fields set via Object.assign from defaults+params; TS can't see that, so use !
  id!: string | null;
  power!: number;
  gainBoost!: number;
  minDecibels!: number;
  maxDecibels!: number;
  minFrequency!: number;
  maxFrequency!: number;
  smoothingTimeConstant!: number;
  numBuckets!: number;
  split!: boolean;
  xEasing!: ((n: number) => number) | undefined;
  yEasing!: ((n: number) => number) | undefined;
  xExponent!: number | undefined;
  yExponent!: number | undefined;
  binMethod!: string;
  fftSize!: number;
  frequencyBinCount!: number;
  nyquist!: number;
  binSize!: number;
  adj!: number;
  binMin!: number;
  binMax!: number;
  bucketCounts!: number[];
  bucketData!: number[];
  analyser!: AnalyserNode | SplitAnalyser;
  fftData!: FftData;
  timeData!: FftData;

  constructor(context: AudioContext, input: AudioNode, params: AnalyserParams) {
    this.input = input;
    this.context = context;

    const defaults = {
      id: null,
      power: 13,
      gainBoost: 0,
      minDecibels: -130,
      maxDecibels: 0,
      minFrequency: 20,
      maxFrequency: 16500,
      smoothingTimeConstant: 0.8,
      numBuckets: 10,
      split: false,
      xEasing: undefined as ((n: number) => number) | undefined,
      yEasing: undefined as ((n: number) => number) | undefined,
      binMethod: "center",
    };

    Object.assign(this, { ...defaults, ...params });
    this.fftSize = Math.pow(2, this.power);
    this.frequencyBinCount = this.fftSize / 2;
    this.nyquist = this.context.sampleRate / 2;
    this.binSize = this.nyquist / this.frequencyBinCount;
    this.adj =
      this.binMethod === "center"
        ? 0.5
        : this.binMethod === "start"
        ? 0
        : this.binMethod === "end"
        ? 1
        : 0.5;

    // represents the first and last bin to take to stay true to frequency bounds
    // errs on the side of preserving more data
    this.binMin = Math.floor(this.minFrequency / this.binSize);
    this.binMax =
      this.frequencyBinCount -
      Math.floor((this.nyquist - this.maxFrequency) / this.binSize);

    // create once to optimize render loops
    this.bucketCounts = new Array(this.numBuckets).fill(0, 0, this.numBuckets);
    this.bucketData = new Array(this.numBuckets).fill(0, 0, this.numBuckets);

    // update the min / max according to the actual calculated above
    this.minFrequency = (this.binMin + this.adj) * this.binSize;
    this.maxFrequency = (this.binMax + this.adj) * this.binSize;

    // convert any string easing params into functions
    if (typeof this.xEasing === "string") {
      switch (this.xEasing) {
        case "polyIn":
          this.xEasing = d3.easePolyIn.exponent(this.xExponent!);
          break;
        case "polyOut":
          this.xEasing = d3.easePolyOut.exponent(this.xExponent!);
          break;
        case "polyInOut":
          this.xEasing = d3.easePolyInOut.exponent(this.xExponent!);
          break;
        default:
          this.xEasing = (n) => n;
          break;
      }
    }

    if (typeof this.yEasing === "string") {
      switch (this.yEasing) {
        case "polyIn":
          this.yEasing = d3.easePolyIn.exponent(this.yExponent!);
          break;
        case "polyOut":
          this.yEasing = d3.easePolyOut.exponent(this.yExponent!);
          break;
        case "polyInOut":
          this.yEasing = d3.easePolyInOut.exponent(this.yExponent!);
          break;
        default:
          this.yEasing = (n) => n;
          break;
      }
    }

    this.createAudioNodes();
    this.createDataStructure();
  }

  createAudioNodes(split = this.split): void {
    if (split) {
      // if split === true, this.analyser is an obj with 'left' and 'right' properties
      const splitter = this.context.createChannelSplitter(2);

      // feed in the input
      this.input.connect(splitter);

      const splitAnalyser: SplitAnalyser = {
        left: this.context.createAnalyser(),
        right: this.context.createAnalyser(),
      };
      this.analyser = splitAnalyser;

      splitter.connect(splitAnalyser.left, 0);
      splitter.connect(splitAnalyser.right, 1);

      // web audio parameters
      splitAnalyser.left.fftSize = Math.pow(2, this.power);
      splitAnalyser.left.minDecibels = this.minDecibels;
      splitAnalyser.left.maxDecibels = this.maxDecibels;
      splitAnalyser.left.smoothingTimeConstant = this.smoothingTimeConstant;

      // web audio parameters
      splitAnalyser.right.fftSize = Math.pow(2, this.power);
      splitAnalyser.right.minDecibels = this.minDecibels;
      splitAnalyser.right.maxDecibels = this.maxDecibels;
      splitAnalyser.right.smoothingTimeConstant = this.smoothingTimeConstant;
    } else {
      // if split === false, this.analser is a single stereo analyser
      const analyser = this.context.createAnalyser();
      analyser.fftSize = Math.pow(2, this.power);
      analyser.minDecibels = this.minDecibels;
      analyser.maxDecibels = this.maxDecibels;
      analyser.smoothingTimeConstant = this.smoothingTimeConstant;
      this.analyser = analyser;

      // connect processing nodes if applicable
      const chain = this.createProcessingNodes();
      if (chain) {
        this.input.connect(chain);
        chain.connect(analyser);
      } else {
        // otherwise just feed in the input
        this.input.connect(analyser);
      }
    }
  }

  createProcessingNodes(): GainNode | null {
    if (this.gainBoost !== 0) {
      const gainBoost = this.context.createGain();
      gainBoost.gain.value = this.gainBoost;
      return gainBoost;
    } else {
      return null;
    }
  }

  createDataStructure(split = this.split): void {
    if (split) {
      const sa = this.analyser as SplitAnalyser;
      this.fftData = {
        left: new Uint8Array(sa.left.frequencyBinCount) as Uint8Array<ArrayBuffer>,
        right: new Uint8Array(sa.right.frequencyBinCount) as Uint8Array<ArrayBuffer>,
      };
      this.timeData = {
        left: new Uint8Array(sa.left.fftSize) as Uint8Array<ArrayBuffer>,
        right: new Uint8Array(sa.right.fftSize) as Uint8Array<ArrayBuffer>,
      };
    } else {
      const an = this.analyser as AnalyserNode;
      this.fftData = new Uint8Array(an.frequencyBinCount) as Uint8Array<ArrayBuffer>;
      this.timeData = new Uint8Array(an.fftSize) as Uint8Array<ArrayBuffer>;
    }
  }

  getFrequencyData(channel?: string): void {
    if (channel === "left" || channel === "right") {
      const sa = this.analyser as SplitAnalyser;
      const fd = this.fftData as SplitUint8;
      sa[channel].getByteFrequencyData(fd[channel]); // refresh in place
      this.yEasing &&
        fd[channel].forEach(
          (d, i, a) => (a[i] = 255 * this.yEasing!(d / 255))
        ); // map in place
    } else {
      (this.analyser as AnalyserNode).getByteFrequencyData(
        this.fftData as Uint8Array<ArrayBuffer>
      ); // refresh in place
      this.yEasing &&
        (this.fftData as Uint8Array<ArrayBuffer>).forEach(
          (d, i, a) => (a[i] = 255 * this.yEasing!(d / 255))
        ); // map in place
    }
  }

  getFrequencyBins(channel?: string): { data: number; freq: number }[] {
    const fBins: { data: number; freq: number }[] = [];
    this.getFrequencyData(channel);
    const data = (this.fftData as Uint8Array<ArrayBuffer>).slice(
      this.binMin,
      this.binMax + 1
    );

    data.forEach((d: number, i: number) => {
      fBins.push({
        data: d,
        freq: (this.binMin + i + this.adj) * this.binSize,
      });
    });

    return fBins;
  }

  getFrequencyBuckets(channel?: string): void {
    this.getFrequencyData(channel);

    // reset buckets
    this.bucketData.forEach((d, i, a) => {
      a[i] = 0;
      this.bucketCounts[i] = 0;
    });

    for (let i = this.binMin; i <= this.binMax; i++) {
      const n = this.xEasing
        ? Math.floor(
            this.xEasing(i / (this.binMax - this.binMin + 1)) * this.numBuckets
          )
        : Math.floor((i / (this.binMax - this.binMin + 1)) * this.numBuckets);

      this.bucketData[n] += (this.fftData as Uint8Array<ArrayBuffer>)[i];
      this.bucketCounts[n] += 1;
    }

    this.bucketData.forEach((d, i, a) => (a[i] = d / this.bucketCounts[i]));
  }

  getTimeData(channel?: string): void {
    if (channel === "left" || channel === "right") {
      const sa = this.analyser as SplitAnalyser;
      const td = this.timeData as SplitUint8;
      sa[channel].getByteTimeDomainData(td[channel]);
    } else {
      (this.analyser as AnalyserNode).getByteTimeDomainData(
        this.timeData as Uint8Array<ArrayBuffer>
      );
    }
  }

  reconnect(newInput: AudioNode): void {
    this.input.disconnect();
    newInput.connect(this.analyser as AnalyserNode);
  }
}
