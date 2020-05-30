import * as d3 from "d3-ease";

export class Analyser {
  constructor(context, input, params) {
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
      xEasing: undefined,
      yEasing: undefined,
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
          this.xEasing = d3.easePolyIn.exponent(this.xExponent);
          break;
        case "polyOut":
          this.xEasing = d3.easePolyOut.exponent(this.xExponent);
          break;
        case "polyInOut":
          this.xEasing = d3.easePolyInOut.exponent(this.xExponent);
          break;
        default:
          this.xEasing = (n) => n;
          break;
      }
    }

    if (typeof this.yEasing === "string") {
      switch (this.yEasing) {
        case "polyIn":
          this.yEasing = d3.easePolyIn.exponent(this.yExponent);
          break;
        case "polyOut":
          this.yEasing = d3.easePolyOut.exponent(this.yExponent);
          break;
        case "polyInOut":
          this.yEasing = d3.easePolyInOut.exponent(this.yExponent);
          break;
        default:
          this.yEasing = (n) => n;
          break;
      }
    }

    this.createAudioNodes();
    this.createDataStructure();
  }

  createAudioNodes(split = this.split) {
    if (split) {
      // if split === true, this.analyser is an obj with 'left' and 'right' properties
      const splitter = this.context.createChannelSplitter(2);

      // feed in the input
      this.input.connect(splitter);

      this.analyser = {};
      this.analyser.left = this.context.createAnalyser();
      this.analyser.right = this.context.createAnalyser();

      splitter.connect(this.analyser.left, 0);
      splitter.connect(this.analyser.right, 1);

      // web audio parameters
      this.analyser.left.fftSize = Math.pow(2, this.power);
      this.analyser.left.minDecibels = this.minDecibels;
      this.analyser.left.maxDecibels = this.maxDecibels;
      this.analyser.left.smoothingTimeConstant = this.smoothingTimeConstant;

      // web audio parameters
      this.analyser.right.fftSize = Math.pow(2, this.power);
      this.analyser.right.minDecibels = this.minDecibels;
      this.analyser.right.maxDecibels = this.maxDecibels;
      this.analyser.right.smoothingTimeConstant = this.smoothingTimeConstant;
    } else {
      // if split === false, this.analser is a single stereo analyser
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize = Math.pow(2, this.power);
      this.analyser.minDecibels = this.minDecibels;
      this.analyser.maxDecibels = this.maxDecibels;
      this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

      // connect processing nodes if applicable
      const chain = this.createProcessingNodes();
      if (chain) {
        this.input.connect(chain);
        chain.connect(this.analyser);
      } else {
        // otherwise just feed in the input
        this.input.connect(this.analyser);
      }
    }
  }

  createProcessingNodes() {
    if (this.gainBoost !== 0) {
      const gainBoost = this.context.createGain();
      gainBoost.gain.value = this.gainBoost;
      return gainBoost;
    } else {
      return null;
    }
  }

  createDataStructure(split = this.split) {
    if (split) {
      this.fftData = {};
      this.timeData = {};
      this.fftData.left = new Uint8Array(this.analyser.left.frequencyBinCount);
      this.fftData.right = new Uint8Array(
        this.analyser.right.frequencyBinCount
      );
      this.timeData.left = new Uint8Array(this.analyser.left.fftSize);
      this.timeData.right = new Uint8Array(this.analyser.right.fftSize);
    } else {
      this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
      this.timeData = new Uint8Array(this.analyser.fftSize);
    }
  }

  getFrequencyData(channel) {
    if (channel === "left" || channel === "right") {
      this.analyser[channel].getByteFrequencyData(this.fftData[channel]); // refresh in place
      this.yEasing &&
        this.fftData[channel].forEach(
          (d, i, a) => (a[i] = 255 * this.yEasing(d / 255))
        ); // map in place
    } else {
      this.analyser.getByteFrequencyData(this.fftData); // refresh in place
      this.yEasing &&
        this.fftData.forEach((d, i, a) => (a[i] = 255 * this.yEasing(d / 255))); // map in place
    }
  }

  getFrequencyBins(channel) {
    const fBins = [];
    const data = this.getFrequencyData(channel).slice(
      this.binMin,
      this.binMax + 1
    );

    data.forEach((d, i) => {
      fBins.push({
        data: d,
        freq: (this.binMin + i + this.adj) * this.binSize,
      });
    });

    return fBins;
  }

  getFrequencyBuckets(channel) {
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

      this.bucketData[n] += this.fftData[i];
      this.bucketCounts[n] += 1;
    }

    this.bucketData.forEach((d, i, a) => (a[i] = d / this.bucketCounts[i]));
  }

  getTimeData(channel) {
    if (channel === "left" || channel === "right") {
      this.analyser[channel].getByteTimeDomainData(this.timeData[channel]);
    } else {
      this.analyser.getByteTimeDomainData(this.timeData);
    }
  }

  reconnect(newInput) {
    this.input.disconnect();
    newInput.connect(this.analyser);
  }
}
