import {AudioStream} from "./AudioStream";
import {OpusConfig} from "../../types";
import {Recorder} from "symbl-opus-encdec";

export class OpusAudioStream extends AudioStream {

    /**
     * @ignore
     */
    private opusEncoder: Recorder;

    /**
     * @ignore
     */
    private config: OpusConfig = {
        "encoderComplexity": 6,
        "encoderFrameSize": 20,
        "encoderSampleRate": 48000,
        "maxFramesPerPage": 40,
        "numberOfChannels": 1,
        "rawOpus": true,
        "streamPages": true
    }

    /**
     * Creates instance of AudioStream using Opus encoding
     * @param sourceNode MediaStreamAudioSourceNode
     * @param config OpusConfig
     */
    constructor (sourceNode?: MediaStreamAudioSourceNode, config?: OpusConfig) {

        super(sourceNode);

        if (config) {

            this.config = config;

        }

        // Validate `config` and throw appropriate error if the validation fails

        this.processAudio = this.processAudio.bind(this);
        this.attachAudioProcessor = this.attachAudioProcessor.bind(this);
        this.attachAudioSourceElement = this.attachAudioSourceElement.bind(this);
        this.attachAudioDevice = this.attachAudioDevice.bind(this);
        this.attachAudioCallback = this.attachAudioCallback.bind(this);

    }

    /**
     * Sends audio data to the processor
     * @param audioData unknown
     */
    processAudio (audioData: unknown): void {

        super.onProcessedAudio(audioData);

    }

    /**
     * Resets the Opus encoder and attaches the streaming audio data to processor
     * @param reInitialise boolean
     */
    async attachAudioProcessor (reInitialise?: boolean): Promise<void> {

        if (reInitialise && this.opusEncoder) {

            this.resetOpusEncoder();

        }

        if (!this.opusEncoder) {

            this.mediaStream = this.mediaStream ? this.mediaStream : await AudioStream.getMediaStream();
            this.config.sourceNode = <MediaStreamAudioSourceNode>this.sourceNode;
            console.log("===== sourceNode ======", this.config.sourceNode);
            this.opusEncoder = new Recorder(this.config);

        }

        await this.opusEncoder.start();
        this.opusEncoder.ondataavailable = this.processAudio;

    }

    /**
     * Attaches DOM <audio> element to the audio data stream
     * @param audioSourceDomElement HTMLAudioElement
     */
    async attachAudioSourceElement (audioSourceDomElement: HTMLAudioElement): Promise<void> {

        const element = super.attachAudioSourceElement(audioSourceDomElement);
        await this.attachAudioProcessor(true);
        return element;

    }

    /**
     * Detaches DOM <audio> element from the audio data stream
     */
    async detachAudioSourceElement (): Promise<void> {

        await super.detachAudioSourceElement();

    }

    /**
     * Updates the DOM <audio> element by detaching from any previously connected and connecting with
     * the provided DOM element
     * @param audioSourceDomElement HTMLAudioElement
     */
    async updateAudioSourceElement (audioSourceDomElement: HTMLAudioElement): Promise<void> {

        await super.updateAudioSourceElement(audioSourceDomElement);

    }

    /**
     * Attaches a provided MediaStream audio input device to the the audio data stream
     * @param deviceId string
     * @param mediaStream MediaStream
     */
    async attachAudioDevice (deviceId: string, mediaStream?: MediaStream): Promise<void> {

        await super.attachAudioDevice(
            deviceId,
            mediaStream
        );
        await this.attachAudioProcessor(true);

    }

    /**
     * Detaches the currently connected MediaStream audio input device from the audio data stream
     */
    async detachAudioDevice (): Promise<void> {

        await super.detachAudioDevice();
        this.resetOpusEncoder();

    }

    /**
     * Detaches any existing MediaStream audio input device and connects the provided MediaStream
     * audio input device
     * @param deviceId string
     * @param mediaStream MediaStream
     */
    async updateAudioDevice (deviceId: string, mediaStream?: MediaStream): Promise<void> {

        await super.updateAudioDevice(
            deviceId,
            mediaStream
        );

    }

    /**
     * Adds a callback function for incoming audio data
     * @param audioCallback function
     */
    attachAudioCallback (audioCallback: (audioData) => void): void {

        super.attachAudioCallback(audioCallback);

    }

    /**
     * Closes and re-opens the Opus encoder
     */
    private async resetOpusEncoder () {

        if (this.opusEncoder) {

            await this.opusEncoder.pause();
            this.opusEncoder.ondataavailable = () => {};
            await this.opusEncoder.close();
            this.opusEncoder = null;

        }

    }

}
