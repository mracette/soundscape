export default class Analyser {
    
    constructor(context, input, params){

        const defaults = {
            split: false,
            type: 'fft',
            power: 13,
            minDecibels: -130,
            maxDecibels: 0,
            smoothingTimeConstant: 0.8
        }

        const properties = Object.assign({}, defaults, params);

        Object.keys(defaults).forEach(prop => {
            this[prop] = properties[prop];
        })

        this.input = input;
        this.output = null;

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

        // if split === false, this.analser is a single stereo analyser and this class' 
        // getter functions do not take a channel parameter
        } else {
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
        if(this.split) {
            this.fftData = {};
            this.timeData = {};
            this.fftData.left = new Uint8Array(this.analyser.left.frequencyBinCount);
            this.fftData.right = new Uint8Array(this.analyser.right.frequencyBinCount);
            this.timeData.left = new Uint8Array(this.analyser.left.fftSize);
            this.timeData.right = new Uint8Array(this.analyser.right.fftSize);
        } else {
            this.fftData = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeData = new Uint8Array(this.analyser.fftSize);
        }

        // set routing
        if(this.split) {
            this.merger = context.createChannelMerger(2);
            this.analyser.left.connect(this.merger, 0, 0);
            this.analyser.right.connect(this.merger, 0, 1);

            // set the output as the channel merger node
            this.output = this.merger;
        } else {          
            // set the output as the analyser node
            this.output = this.analyser;
        }
    }

    getFrequencyData(channel) {
        if(this.split) {
            this.analyser[channel].getByteFrequencyData(this.fftData[channel]);
            return this.fftData[channel];
        } else {
            this.analyser.getByteFrequencyData(this.fftData);
            return this.fftData.slice(this.minBinIndex, this.maxBinIndex);
        }
    }

    getTimeData(channel) {
        if(this.split) {
            this.analyser[channel].getByteTimeDomainData(this.timeData[channel]);
            return this.fftData[channel];
        } else {
            this.analyser.getByteTimeDomainData(this.timeData);
            return this.timeData;
        }
    }

}