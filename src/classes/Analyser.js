export class Analyser {

    constructor(context, input, params) {

        this.input = input;
        this.context = context;

        const defaults = {
            id: null,
            split: false,
            freqResponse: 'byte',
            timeResponse: 'byte',
            aWeighted: false,
            power: 13,
            minDecibels: -130,
            maxDecibels: 0,
            smoothingTimeConstant: 0.8
        }

        Object.assign(this, { ...defaults, ...params });

        // if split === true, this.analyser is an obj with 'left' and 'right' properties
        // channel data is received by passing 'left' or 'right' into this class' getter functions
        if (this.split) {

            const splitter = context.createChannelSplitter(2);

            // feed in the input
            this.input.connect(splitter);

            this.analyser = {};
            this.analyser.left = context.createAnalyser();
            this.analyser.right = context.createAnalyser();

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

            // if split === false, this.analser is a single stereo analyser and this class' 
            // getter functions do not take a channel parameter
            this.analyser = context.createAnalyser();
            this.analyser.fftSize = Math.pow(2, this.power);
            this.analyser.minDecibels = this.minDecibels;
            this.analyser.maxDecibels = this.maxDecibels;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

            // feed in the input
            this.input.connect(this.analyser);
        }

        // bind the bin count and fftSize
        this.frequencyBinCount = this.split ? this.analyser.right.frequencyBinCount : this.analyser.frequencyBinCount;
        this.fftSize = this.split ? this.analyser.right.fftSize : this.analyser.fftSize;

        // create containers for frequency and time data
        if (this.split) {

            this.fftData = {};
            this.timeData = {};

            this.fftData.left = this.freqResponse === 'byte' ?
                new Uint8Array(this.analyser.left.frequencyBinCount) :
                new Float32Array(this.analyser.left.frequencyBinCount);

            this.fftData.right = this.freqResponse === 'byte' ?
                new Uint8Array(this.analyser.right.frequencyBinCount) :
                new Float32Array(this.analyser.right.frequencyBinCount);

            this.timeData.left = this.timeResponse === 'byte' ?
                new Float32Array(this.analyser.left.fftSize) :
                new Uint8Array(this.analyser.left.fftSize);

            this.timeData.right = this.timeResponse === 'byte' ?
                new Float32Array(this.analyser.right.fftSize) :
                new Uint8Array(this.analyser.right.fftSize);

        } else {

            this.fftData = this.freqResponse === 'byte' ?
                new Uint8Array(this.analyser.frequencyBinCount) :
                new Float32Array(this.analyser.left.frequencyBinCount);

            this.timeData = this.timeResponse === 'byte' ?
                new Uint8Array(this.analyser.fftSize) :
                new Float32Array(this.analyser.fftSize);

        }

        if (this.aWeighted) { this.initAWeights() }

    }

    getFrequencyData(channel, start, end) {

        if (this.split) {

            if (this.freqResponse === 'byte') {

                // update the array with the latest fft data
                this.analyser[channel].getByteFrequencyData(this.fftData[channel]);
                return this.fftData[channel].slice(start, end);

            }

            else if (this.freqResponse === 'float') {
                this.analyser[channel].getFloatFrequencyData(this.fftData[channel]);
                return this.fftData[channel].slice(start, end);
            }

        } else {

            if (this.freqResponse === 'byte') {

                // update the array with the latest fft data
                this.analyser.getByteFrequencyData(this.fftData);
                return this.fftData.slice(start, end);

            }

            else if (this.freqResponse === 'float') {

                // update the array with the latest fft data
                this.analyser.getFloatFrequencyData(this.fftData);
                return this.fftData.slice(start, end);

            }

        }
    }

    getTimeData(channel) {

        if (this.split) {

            if (this.timeResponse === 'byte') {
                this.analyser[channel].getByteTimeDomainData(this.timeData[channel]);
                return this.fftData[channel];
            }

            else if (this.timeResponse === 'float') {
                this.analyser[channel].getFloatTimeDomainData(this.timeData[channel]);
                return this.fftData[channel];
            }

        } else {

            if (this.timeResponse === 'byte') {
                this.analyser.getByteTimeDomainData(this.timeData);
                return this.timeData;
            }

            else if (this.timeResponse === 'float') {
                this.analyser.getFloatTimeDomainData(this.timeData);
                return this.timeData;
            }

        }

    }

    initAWeights() {

        const a = (f) => {
            var f2 = f * f;
            return 1.2588966 * 148840000 * f2 * f2 /
                ((f2 + 424.36) * Math.sqrt((f2 + 11599.29) * (f2 + 544496.41)) * (f2 + 148840000));
        };

        // get the center point of each frequency bin
        const freqBins = new Array(this.frequencyBinCount);
        const nyquist = this.context.sampleRate / 2;
        const binSize = nyquist / this.frequencyBinCount;

        for (let i = 0; i < this.frequencyBinCount; i++) {
            freqBins[i] = (i + 0.5) * binSize;
        }

        this.aWeights = freqBins.map(f => a(f));

    }

}