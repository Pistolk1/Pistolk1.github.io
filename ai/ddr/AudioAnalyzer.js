// audioAnalyzer.js

class AudioAnalyzer {
    constructor() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.analyzer = this.audioContext.createAnalyser();
        this.dataArray = new Uint8Array(2048);
        this.beatTimes = [];
        this.source = null; // Initialize source as null
    }

    async loadAudio(file) {
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

        // Create source and connect to analyzer
        this.source = this.audioContext.createBufferSource();
        this.source.buffer = audioBuffer;
        this.source.connect(this.analyzer);
        this.analyzer.connect(this.audioContext.destination);
        
        // Call the analyze function once the source is loaded
        this.analyzeAudio(audioBuffer);
        
        return this; // Return the AudioAnalyzer instance
    }

    analyzeAudio(audioBuffer) {
        const sampleRate = audioBuffer.sampleRate;
        const totalDuration = audioBuffer.duration;

        // Simple beat detection based on amplitude
        const frequencyData = new Uint8Array(this.analyzer.frequencyBinCount);
        this.analyzer.getByteFrequencyData(frequencyData);

        const threshold = 128; // Arbitrary threshold for beat detection

        const checkForBeat = () => {
            this.analyzer.getByteFrequencyData(frequencyData);
            const average = frequencyData.reduce((a, b) => a + b) / frequencyData.length;
            if (average > threshold) {
                const currentTime = this.audioContext.currentTime;
                this.beatTimes.push(currentTime);
                // Trigger event or callback to generate arrows
                this.onBeatDetected(currentTime);
            }
            requestAnimationFrame(checkForBeat);
        };
        
        requestAnimationFrame(checkForBeat);
    }

    onBeatDetected(currentTime) {
        // Can be overridden in game logic to handle beat detection
        console.log(`Beat detected at: ${currentTime.toFixed(2)} seconds`);
    }
}
