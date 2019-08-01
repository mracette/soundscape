const Tone = require('tone');

class Analyser {
    constructor(context, source, params){
        const defaults = {
            type: 'fft',
            power: 13,
            minDecibels: -100,
            maxDecibels: 0,
            smoothingTimeConstant: 0.8,
            minFrequency: 25,
            maxFrequency: 18500
        }

        const properties = Object.assign({}, defaults, params);

        Object.keys(defaults).forEach(prop => {
            this[prop] = properties[prop];
        })

        // web audio parameters
        this.analyser = context.createAnalyser();
        this.analyser.fftSize = Math.pow(2, this.power);
        this.analyser.minDecibels = this.minDecibels;
        this.analyser.maxDecibels = this.maxDecibels;
        this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;


        // calculate bin width and find the bins in this.fftData that will
        // be under this.minFrequency or over this.maxFrequency
        let binWidth = 22051/this.analyser.frequencyBinCount
        let minIndex = 0
        let maxIndex = this.analyser.frequencyBinCount;
        while (binWidth * minIndex <= this.minFrequency) {minIndex++;}
        while (binWidth * maxIndex >= this.maxFrequency) {maxIndex--;}

        // bind the bin indices
        this.minBinIndex = minIndex;
        this.maxBinIndex = maxIndex
        this.numBands = this.analyser.frequencyBinCount - minIndex
            - (this.analyser.frequencyBinCount - maxIndex - 1);

        // create containers for frequency and time data
        this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
        this.timeData = new Uint8Array(this.analyser.fftSize);

        // set routing
        source.connect(this.analyser);
        this.analyser.connect(context.destination);
    }

    getFrequencyData() {
        this.analyser.getByteFrequencyData(this.fftData);
        return this.fftData.slice(this.minBinIndex, this.maxBinIndex);
    }

    getTimeData() {
        this.analyser.getByteTimeDomainData(this.timeData);
        return this.timeData;
    }

}

module.exports = Analyser;